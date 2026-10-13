from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, Iterable, List, Optional

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


def detect_student_segment(student: Any) -> Optional[Dict[str, Any]]:
    academic = _coerce_float(_student_value(student, 'academic_score', 'exam_average'))
    attendance = _coerce_float(_student_value(student, 'attendance'))
    placement = _coerce_float(_student_value(student, 'placement_readiness'))
    technical = _coerce_float(_student_value(student, 'technical_skills'))
    aptitude = _coerce_float(_student_value(student, 'aptitude_score'))
    communication = _coerce_float(_student_value(student, 'communication_score'))
    previous_score = _coerce_float(_student_value(student, 'previous_score'))
    previous_attendance = _coerce_float(_student_value(student, 'previous_attendance'))
    risk_flags = evaluate_risk_flags(student)

    if academic is not None and placement is not None and academic >= 75 and placement < 60:
        return {
            'name': 'Strong academic performance but low placement readiness',
            'definition': 'Academic output is strong while readiness for placements is still below the configured threshold.',
            'indicators': ['academic_score >= 75', 'placement_readiness < 60'],
            'next_steps': 'Increase mock interviews, resume review, and placement readiness training.',
        }

    if attendance is not None and academic is not None and attendance >= 80 and academic < 60:
        return {
            'name': 'Good attendance but weak academic performance',
            'definition': 'Attendance remains healthy, but the student needs academic support to improve course outcomes.',
            'indicators': ['attendance >= 80', 'academic_score < 60'],
            'next_steps': 'Arrange remedial support, mentoring, and subject-wise revision schedules.',
        }

    if technical is not None and (aptitude is not None or communication is not None) and technical >= 70 and ((aptitude is not None and aptitude < 55) or (communication is not None and communication < 60)):
        return {
            'name': 'Strong technical skills but weaker aptitude or communication',
            'definition': 'The student shows technical strength but needs additional aptitude and communication support.',
            'indicators': ['technical_skills >= 70', 'aptitude_score < 55 or communication_score < 60'],
            'next_steps': 'Add aptitude coaching, communication drills, and mock interviews.',
        }

    if len(risk_flags) >= 2:
        return {
            'name': 'Multiple support indicators',
            'definition': 'The student shows several support needs across academic, placement, and data-quality indicators.',
            'indicators': ['multiple academic or placement flags'],
            'next_steps': 'Schedule a mentor review and create an individualized support plan.',
        }

    if previous_score is not None and academic is not None and academic > previous_score + 5 and (previous_attendance is None or attendance is None or attendance >= previous_attendance):
        return {
            'name': 'Improving performance',
            'definition': 'The student shows sustained improvement compared with the prior measurement.',
            'indicators': ['current academic score > previous_score + 5'],
            'next_steps': 'Continue mentoring and recognize gains while strengthening weaker skills.',
        }

    if previous_score is not None and academic is not None and academic < previous_score - 5:
        return {
            'name': 'Declining performance',
            'definition': 'The student shows a decline when compared with prior academic performance.',
            'indicators': ['current academic score < previous_score - 5'],
            'next_steps': 'Initiate early intervention, regular check-ins, and targeted academic guidance.',
        }

    if not risk_flags:
        return {
            'name': 'Insufficient data for reliable assessment',
            'definition': 'The dataset does not provide enough valid information for a dependable segment assignment.',
            'indicators': ['insufficient valid risk indicators'],
            'next_steps': 'Collect missing academic and participation records before segmenting the student.',
        }

    return None


def build_segment_summary(students: Iterable[Any]) -> List[Dict[str, Any]]:
    counts: defaultdict = defaultdict(int)
    details: Dict[str, Dict[str, Any]] = {}
    for student in students:
        segment = detect_student_segment(student)
        if not segment:
            continue
        counts[segment['name']] += 1
        details.setdefault(segment['name'], {
            'name': segment['name'],
            'definition': segment['definition'],
            'indicators': segment['indicators'],
            'next_steps': segment['next_steps'],
        })

    summary = []
    for name, data in details.items():
        summary.append({
            'name': name,
            'count': counts[name],
            'definition': data['definition'],
            'indicators': data['indicators'],
            'next_steps': data['next_steps'],
        })
    return sorted(summary, key=lambda item: (-item['count'], item['name']))
