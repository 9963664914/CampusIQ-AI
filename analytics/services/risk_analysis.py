from __future__ import annotations

from typing import Any, Dict, List

from analytics.services.scoring import _coerce_float, calculate_student_score


def _student_value(student: Any, *keys: str) -> Any:
    if isinstance(student, dict):
        for key in keys:
            value = student.get(key)
            if value is not None:
                return value
        return None
    for key in keys:
        value = getattr(student, key, None)
        if value is not None:
            return value
    return None


def _academic_value(student: Any) -> Any:
    academic = _student_value(student, 'academic_score', 'exam_average')
    if academic is not None:
        return _coerce_float(academic)
    return None


def evaluate_risk_flags(student: Any) -> List[Dict[str, Any]]:
    flags: List[Dict[str, Any]] = []
    attendance = _coerce_float(_student_value(student, 'attendance'))
    academic = _academic_value(student)
    placement = _coerce_float(_student_value(student, 'placement_readiness'))
    aptitude = _coerce_float(_student_value(student, 'aptitude_score'))
    communication = _coerce_float(_student_value(student, 'communication_score'))
    technical = _coerce_float(_student_value(student, 'technical_skills'))
    lms = _coerce_float(_student_value(student, 'lms_engagement'))

    score_summary = calculate_student_score({
        'academic_score': _student_value(student, 'academic_score'),
        'exam_average': _student_value(student, 'exam_average'),
        'attendance': _student_value(student, 'attendance'),
        'lms_engagement': _student_value(student, 'lms_engagement'),
        'placement_readiness': _student_value(student, 'placement_readiness'),
        'technical_skills': _student_value(student, 'technical_skills'),
        'aptitude_score': _student_value(student, 'aptitude_score'),
        'communication_score': _student_value(student, 'communication_score'),
        'engagement_score': _student_value(student, 'engagement_score'),
        'feedback_score': _student_value(student, 'feedback_score'),
    })

    if attendance is not None and attendance < 75:
        level = 'high' if attendance < 60 else 'moderate'
        flags.append({
            'type': 'academic',
            'level': level,
            'rule': 'attendance < 75',
            'evidence': {'attendance': attendance},
            'message': 'Academic support recommended because attendance is below the configured threshold and the student may need follow-up support.'
        })

    if academic is not None and academic < 60:
        level = 'high' if academic < 50 else 'moderate'
        flags.append({
            'type': 'academic',
            'level': level,
            'rule': 'academic_score < 60',
            'evidence': {'academic_score': academic},
            'message': 'Academic support recommended because the exam and academic performance benchmark is below the configured threshold.'
        })

    placement_indicators = []
    if placement is not None:
        placement_indicators.append(('placement_readiness', placement))
    if aptitude is not None:
        placement_indicators.append(('aptitude_score', aptitude))
    if communication is not None:
        placement_indicators.append(('communication_score', communication))
    if technical is not None:
        placement_indicators.append(('technical_skills', technical))

    low_placement = [item for item in placement_indicators if item[1] < 60]
    if low_placement:
        level = 'high' if any(value < 50 for _, value in low_placement) else 'moderate'
        flags.append({
            'type': 'placement',
            'level': level,
            'rule': 'placement and readiness indicators < 60',
            'evidence': {name: value for name, value in low_placement},
            'message': 'Placement support recommended because readiness indicators are below the configured benchmark and may require skill development.'
        })

    missing_fields = [
        field for field in ['attendance', 'academic_score', 'exam_average', 'lms_engagement', 'placement_readiness', 'technical_skills', 'aptitude_score', 'communication_score', 'engagement_score', 'feedback_score']
        if _student_value(student, field) is None
    ]
    if score_summary['coverage'] < 0.7 or len(missing_fields) >= 4:
        flags.append({
            'type': 'incomplete',
            'level': 'high' if score_summary['coverage'] < 0.5 else 'moderate',
            'rule': 'missing data or low coverage',
            'evidence': {'missing_fields': missing_fields, 'coverage': score_summary['coverage']},
            'message': 'Incomplete-data warning because several indicators are missing or coverage is low for a reliable assessment.'
        })

    if lms is not None and lms < 50:
        flags.append({
            'type': 'incomplete',
            'level': 'moderate',
            'rule': 'lms_engagement < 50',
            'evidence': {'lms_engagement': lms},
            'message': 'Learning engagement appears low; the student may benefit from support for LMS participation and course access.'
        })

    return flags
