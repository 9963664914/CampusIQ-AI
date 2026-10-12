"""
risk_analysis.py — Independent academic and placement support evaluation.

Evaluates academic and placement support needs using transparent,
configurable threshold-based rules. Each support flag includes the
exact factors that triggered it.

IMPORTANT: These are prototype indicators based on configurable thresholds.
They are NOT validated predictions of academic failure or placement outcomes.
Human review is essential before taking any action based on these flags.

Labels used:
- "On Track" — indicators meet or exceed thresholds
- "Needs Review" — one or more indicators are borderline
- "Support Recommended" — multiple indicators below threshold
- "Insufficient Data" — not enough data to assess
"""

import pandas as pd
import numpy as np
from typing import Optional


# ---------- Configurable Thresholds ----------

ACADEMIC_THRESHOLDS = {
    "marks_low": 45,           # Below this = support recommended
    "marks_borderline": 60,    # Below this = needs review
    "attendance_low": 65,      # Below this = attendance concern
    "attendance_borderline": 75,
    "lms_completion_low": 50,
    "lms_completion_borderline": 70,
}

PLACEMENT_THRESHOLDS = {
    "aptitude_low": 45,
    "aptitude_borderline": 60,
    "coding_low": 40,
    "coding_borderline": 55,
    "communication_low": 45,
    "communication_borderline": 60,
    "mock_interview_low": 40,
    "mock_interview_borderline": 55,
}


# ---------- Academic Support Assessment ----------

def assess_academic_support(row: pd.Series) -> dict:
    """
    Assess academic support needs for a single student.

    Returns dict with:
    - status: str — "On Track", "Needs Review", "Support Recommended", "Insufficient Data"
    - factors: list[str] — specific reasons for the status
    - indicator_details: dict — individual indicator assessments
    """
    factors = []
    indicator_details = {}
    indicators_available = 0
    concerns = 0
    borderline = 0

    # Academic marks
    marks = row.get("avg_total_marks")
    if pd.notna(marks):
        indicators_available += 1
        marks = float(marks)
        if marks < ACADEMIC_THRESHOLDS["marks_low"]:
            concerns += 1
            factors.append(f"Average marks ({marks:.1f}%) below {ACADEMIC_THRESHOLDS['marks_low']}% threshold")
            indicator_details["marks"] = "Low"
        elif marks < ACADEMIC_THRESHOLDS["marks_borderline"]:
            borderline += 1
            factors.append(f"Average marks ({marks:.1f}%) borderline (below {ACADEMIC_THRESHOLDS['marks_borderline']}%)")
            indicator_details["marks"] = "Borderline"
        else:
            indicator_details["marks"] = "On Track"

    # Attendance
    attendance = row.get("attendance_percentage")
    if pd.notna(attendance):
        indicators_available += 1
        attendance = float(attendance)
        if attendance < ACADEMIC_THRESHOLDS["attendance_low"]:
            concerns += 1
            factors.append(f"Attendance ({attendance:.1f}%) below {ACADEMIC_THRESHOLDS['attendance_low']}% threshold")
            indicator_details["attendance"] = "Low"
        elif attendance < ACADEMIC_THRESHOLDS["attendance_borderline"]:
            borderline += 1
            factors.append(f"Attendance ({attendance:.1f}%) borderline (below {ACADEMIC_THRESHOLDS['attendance_borderline']}%)")
            indicator_details["attendance"] = "Borderline"
        else:
            indicator_details["attendance"] = "On Track"

    # LMS completion
    lms = row.get("assignment_completion_rate")
    if pd.notna(lms):
        indicators_available += 1
        lms = float(lms)
        if lms < ACADEMIC_THRESHOLDS["lms_completion_low"]:
            concerns += 1
            factors.append(f"Assignment completion ({lms:.1f}%) below {ACADEMIC_THRESHOLDS['lms_completion_low']}% threshold")
            indicator_details["lms_completion"] = "Low"
        elif lms < ACADEMIC_THRESHOLDS["lms_completion_borderline"]:
            borderline += 1
            factors.append(f"Assignment completion ({lms:.1f}%) borderline (below {ACADEMIC_THRESHOLDS['lms_completion_borderline']}%)")
            indicator_details["lms_completion"] = "Borderline"
        else:
            indicator_details["lms_completion"] = "On Track"

    # Determine overall status
    if indicators_available == 0:
        status = "Insufficient Data"
        factors.append("No academic, attendance, or LMS data available for assessment")
    elif concerns >= 2:
        status = "Support Recommended"
    elif concerns >= 1 or borderline >= 2:
        status = "Needs Review"
    else:
        status = "On Track"
        if not factors:
            factors.append("All available academic indicators meet thresholds")

    return {
        "status": status,
        "factors": factors,
        "indicator_details": indicator_details,
        "indicators_available": indicators_available,
    }


# ---------- Placement Support Assessment ----------

def assess_placement_support(row: pd.Series) -> dict:
    """
    Assess placement support needs for a single student.

    Returns dict with:
    - status: str — "On Track", "Needs Review", "Support Recommended", "Insufficient Data"
    - factors: list[str] — specific reasons for the status
    - indicator_details: dict — individual indicator assessments
    """
    factors = []
    indicator_details = {}
    indicators_available = 0
    concerns = 0
    borderline = 0

    placement_checks = [
        ("aptitude_score", "Aptitude", "aptitude"),
        ("coding_score", "Coding", "coding"),
        ("communication_score", "Communication", "communication"),
        ("mock_interview_score", "Mock Interview", "mock_interview"),
    ]

    for col, label, key in placement_checks:
        val = row.get(col)
        if pd.notna(val):
            indicators_available += 1
            val = float(val)
            low_thresh = PLACEMENT_THRESHOLDS[f"{key}_low"]
            border_thresh = PLACEMENT_THRESHOLDS[f"{key}_borderline"]

            if val < low_thresh:
                concerns += 1
                factors.append(f"{label} score ({val:.1f}) below {low_thresh} threshold")
                indicator_details[key] = "Low"
            elif val < border_thresh:
                borderline += 1
                factors.append(f"{label} score ({val:.1f}) borderline (below {border_thresh})")
                indicator_details[key] = "Borderline"
            else:
                indicator_details[key] = "On Track"

    # Determine overall status
    if indicators_available == 0:
        status = "Insufficient Data"
        factors.append("No placement assessment data available")
    elif concerns >= 2:
        status = "Support Recommended"
    elif concerns >= 1 or borderline >= 2:
        status = "Needs Review"
    else:
        status = "On Track"
        if not factors:
            factors.append("All available placement indicators meet thresholds")

    return {
        "status": status,
        "factors": factors,
        "indicator_details": indicator_details,
        "indicators_available": indicators_available,
    }


# ---------- Batch Assessment ----------

def assess_all_students(df: pd.DataFrame) -> pd.DataFrame:
    """
    Assess both academic and placement support needs for all students.

    Adds columns:
    - academic_support_status
    - academic_support_factors (JSON string)
    - placement_support_status
    - placement_support_factors (JSON string)
    """
    if df.empty:
        return df.copy()

    academic_results = df.apply(assess_academic_support, axis=1)
    placement_results = df.apply(assess_placement_support, axis=1)

    result_df = df.copy()
    result_df["academic_support_status"] = [r["status"] for r in academic_results]
    result_df["academic_support_factors"] = ["; ".join(r["factors"]) for r in academic_results]
    result_df["placement_support_status"] = [r["status"] for r in placement_results]
    result_df["placement_support_factors"] = ["; ".join(r["factors"]) for r in placement_results]

    return result_df


def get_risk_summary(df: pd.DataFrame) -> dict:
    """
    Get summary counts of support statuses.
    """
    summary = {
        "academic": {},
        "placement": {},
    }

    if "academic_support_status" in df.columns:
        summary["academic"] = df["academic_support_status"].value_counts().to_dict()

    if "placement_support_status" in df.columns:
        summary["placement"] = df["placement_support_status"].value_counts().to_dict()

    return summary
