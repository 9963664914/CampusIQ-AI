from __future__ import annotations

from typing import Any, Dict, List

from analytics.services.risk_analysis import evaluate_risk_flags
from analytics.services.scoring import _coerce_float


def _student_value(student: Any, *keys: str):
    if isinstance(student, dict):
        for key in keys:
            if key in student and student[key] is not None:
                return student[key]
        return None
    for key in keys:
        value = getattr(student, key, None)
        if value is not None:
            return value
    return None


def get_recommendations(student: Any) -> List[str]:
    attendance = _coerce_float(_student_value(student, 'attendance'))
    academic = _coerce_float(_student_value(student, 'academic_score', 'exam_average'))
    aptitude = _coerce_float(_student_value(student, 'aptitude_score'))
    technical = _coerce_float(_student_value(student, 'technical_skills'))
    lms = _coerce_float(_student_value(student, 'lms_engagement'))
    placement = _coerce_float(_student_value(student, 'placement_readiness'))
    flags = evaluate_risk_flags(student)

    recommendations: List[str] = []
    if attendance is not None and attendance < 75:
        recommendations.append('Faculty follow-up and attendance support with a short intervention plan for missed classes.')
    if academic is not None and academic < 60:
        recommendations.append('Subject mentoring and remedial classes focused on weaker assessments and revision cycles.')
    if aptitude is not None and aptitude < 60:
        recommendations.append('Structured aptitude practice with mock tests and timed problem-solving sessions.')
    if technical is not None and technical < 60:
        recommendations.append('Hands-on practical projects and focused technical-skill development to close core gaps.')
    if lms is not None and lms < 50:
        recommendations.append('Investigate LMS access barriers and encourage regular course participation and assignment completion.')
    if placement is not None and placement < 60:
        recommendations.append('Placement-readiness coaching with resume feedback, mock interviews, and communication practice.')
    if len(flags) >= 2:
        recommendations.append('Mentor review and an individualized support plan to monitor the student holistically.')
    if not recommendations:
        recommendations.append('Continue the current support pattern and monitor performance regularly with follow-up checkpoints.')
    return recommendations
