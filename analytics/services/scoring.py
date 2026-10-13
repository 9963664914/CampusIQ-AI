from __future__ import annotations

from typing import Any, Dict, List, Optional

WEIGHTS = {
    'academic': 30,
    'attendance': 20,
    'lms': 15,
    'placement': 15,
    'skills': 10,
    'engagement': 10,
}


def _coerce_float(value: Any) -> Optional[float]:
    if value is None or value == '':
        return None
    if isinstance(value, str):
        value = value.strip().replace('%', '')
        if not value:
            return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    if result != result:
        return None
    return max(0.0, min(100.0, result))


def _safe_average(values: List[Optional[float]]) -> Optional[float]:
    valid = [value for value in values if value is not None]
    if not valid:
        return None
    return round(sum(valid) / len(valid), 2)


def _component_scores(payload: Dict[str, Any]) -> Dict[str, Optional[float]]:
    academic_score = _coerce_float(payload.get('academic_score'))
    exam_average = _coerce_float(payload.get('exam_average'))
    attendance = _coerce_float(payload.get('attendance'))
    lms_engagement = _coerce_float(payload.get('lms_engagement'))
    placement_readiness = _coerce_float(payload.get('placement_readiness'))
    technical_skills = _coerce_float(payload.get('technical_skills'))
    aptitude_score = _coerce_float(payload.get('aptitude_score'))
    communication_score = _coerce_float(payload.get('communication_score'))
    soft_skills = _coerce_float(payload.get('soft_skills'))
    engagement_score = _coerce_float(payload.get('engagement_score'))
    feedback_score = _coerce_float(payload.get('feedback_score'))

    academic_component = _safe_average([academic_score, exam_average])
    skills_component = _safe_average([
        technical_skills,
        aptitude_score,
        communication_score,
        soft_skills,
    ])
    engagement_component = _safe_average([
        engagement_score,
        feedback_score,
    ])

    return {
        'academic': academic_component,
        'attendance': attendance,
        'lms': lms_engagement,
        'placement': placement_readiness,
        'skills': skills_component,
        'engagement': engagement_component,
    }


def calculate_student_score(payload: Dict[str, Any]) -> Dict[str, Any]:
    component_scores = _component_scores(payload)
    eligible = []
    total_weight = sum(WEIGHTS.values())
    missing_components = []

    for component_name, weight in WEIGHTS.items():
        score = component_scores.get(component_name)
        if score is None:
            missing_components.append(component_name)
            continue
        eligible.append((component_name, weight, score))

    if not eligible:
        return {
            'score': 0.0,
            'coverage': 0.0,
            'missing_components': missing_components,
            'component_scores': component_scores,
            'component_contributions': {},
            'weights': WEIGHTS,
            'eligible_components': [],
        }

    weight_total = sum(weight for _, weight, _ in eligible)
    weighted_score = sum(score * weight for _, weight, score in eligible)
    final_score = weighted_score / weight_total
    coverage = round(weight_total / total_weight, 2)
    component_contributions = {
        name: round((score * weight) / weight_total, 2)
        for name, weight, score in eligible
    }

    return {
        'score': round(max(0.0, min(100.0, final_score)), 1),
        'coverage': coverage,
        'missing_components': missing_components,
        'component_scores': component_scores,
        'component_contributions': component_contributions,
        'weights': WEIGHTS,
        'eligible_components': [name for name, _, _ in eligible],
    }
