from __future__ import annotations

import io
from pathlib import Path
from typing import Any, Dict, Iterable, List

import pandas as pd
from django.db import transaction

from analytics.models import StudentRecord
from analytics.services.risk_analysis import evaluate_risk_flags
from analytics.services.scoring import calculate_student_score

MODEL_FIELDS = [
    'student_id', 'name', 'department', 'academic_year', 'attendance', 'academic_score',
    'exam_average', 'lms_engagement', 'placement_readiness', 'technical_skills',
    'aptitude_score', 'communication_score', 'soft_skills', 'engagement_score',
    'feedback_score', 'previous_score', 'previous_attendance', 'placement_status',
    'data_notes',
]
NUMERIC_FIELDS = ['attendance', 'academic_score', 'exam_average', 'lms_engagement', 'placement_readiness', 'technical_skills', 'aptitude_score', 'communication_score', 'soft_skills', 'engagement_score', 'feedback_score', 'previous_score', 'previous_attendance']


def _normalize_key(key: Any) -> str:
    return str(key).strip().lower().replace(' ', '_')


def _parse_numeric(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, str):
        value = value.strip().replace('%', '')
    return float(value)


def validate_student_rows(rows: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    seen_ids = set()
    duplicate_ids = []
    invalid_rows: List[Dict[str, Any]] = []
    valid_rows: List[Dict[str, Any]] = []

    for index, row in enumerate(rows, start=1):
        normalized = { _normalize_key(key): value for key, value in row.items() if key is not None }
        student_id = str(normalized.get('student_id', '')).strip()
        name = str(normalized.get('name', '')).strip()
        errors: List[str] = []

        if not student_id:
            errors.append('Missing student_id')
        elif student_id in seen_ids:
            duplicate_ids.append(student_id)
            errors.append(f'Duplicate student_id: {student_id}')
        else:
            seen_ids.add(student_id)

        if not name:
            errors.append('Missing name')

        for field in NUMERIC_FIELDS:
            value = normalized.get(field)
            if value in (None, '', 'nan', 'NaN'):
                continue
            try:
                numeric = _parse_numeric(value)
            except (TypeError, ValueError):
                errors.append(f'Invalid numeric value for {field}: {value}')
                continue
            if field in {'attendance', 'academic_score', 'exam_average', 'lms_engagement', 'placement_readiness', 'technical_skills', 'aptitude_score', 'communication_score', 'soft_skills', 'engagement_score', 'feedback_score', 'previous_score', 'previous_attendance'} and (numeric < 0 or numeric > 100):
                errors.append(f'{field} must be between 0 and 100')

        if errors:
            invalid_rows.append({'row': index, 'student_id': student_id, 'errors': errors})
            continue

        valid_rows.append({**normalized})

    return {
        'valid_rows': valid_rows,
        'invalid_rows': invalid_rows,
        'duplicate_ids': duplicate_ids,
        'rejected_count': len(invalid_rows),
    }


def import_student_csv(file_or_path: Any) -> Dict[str, Any]:
    if hasattr(file_or_path, 'read'):
        content = file_or_path.read()
        if isinstance(content, str):
            data = pd.read_csv(io.StringIO(content))
        else:
            data = pd.read_csv(io.BytesIO(content))
    else:
        source = Path(file_or_path)
        data = pd.read_csv(source)

    rows = data.to_dict(orient='records')
    validation = validate_student_rows(rows)

    if not validation['valid_rows']:
        return {
            'imported': 0,
            'updated': 0,
            'rejected': validation['rejected_count'],
            'duplicate_ids': validation['duplicate_ids'],
            'invalid_rows': validation['invalid_rows'],
        }

    with transaction.atomic():
        imported = 0
        updated = 0
        for row in validation['valid_rows']:
            student_id = str(row.get('student_id', '')).strip()
            if not student_id:
                continue

            student, created = StudentRecord.objects.get_or_create(student_id=student_id)
            if created:
                imported += 1
            else:
                updated += 1

            for field in MODEL_FIELDS:
                if field not in row:
                    continue
                value = row.get(field)
                if value in ('', None, 'nan', 'NaN'):
                    continue
                if field in NUMERIC_FIELDS:
                    value = float(value)
                setattr(student, field, value)

            score_summary = calculate_student_score({
                'academic_score': student.academic_score,
                'exam_average': student.exam_average,
                'attendance': student.attendance,
                'lms_engagement': student.lms_engagement,
                'placement_readiness': student.placement_readiness,
                'technical_skills': student.technical_skills,
                'aptitude_score': student.aptitude_score,
                'communication_score': student.communication_score,
                'soft_skills': student.soft_skills,
                'engagement_score': student.engagement_score,
                'feedback_score': student.feedback_score,
            })
            student.score = score_summary['score']
            student.score_coverage = score_summary['coverage']
            risk_flags = evaluate_risk_flags(student)
            academic_flags = [flag for flag in risk_flags if flag['type'] == 'academic']
            placement_flags = [flag for flag in risk_flags if flag['type'] == 'placement']
            student.academic_risk = 'high' if academic_flags and any(flag['level'] == 'high' for flag in academic_flags) else ('moderate' if academic_flags else 'low')
            student.placement_risk = 'high' if placement_flags and any(flag['level'] == 'high' for flag in placement_flags) else ('moderate' if placement_flags else 'low')
            student.incomplete_data = any(flag['type'] == 'incomplete' for flag in risk_flags)
            student.save()

    return {
        'imported': imported,
        'updated': updated,
        'rejected': validation['rejected_count'],
        'duplicate_ids': validation['duplicate_ids'],
        'invalid_rows': validation['invalid_rows'],
    }
