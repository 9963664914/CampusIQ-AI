"""
segmentation.py — Student segmentation into actionable groups.

Classifies students into meaningful segments based on their indicator data.
Uses explicit, documented classification rules with clear precedence to
minimize overlapping segments.

Segments:
1. "Strong Academics, Low Placement" — Good academic record but low placement scores
2. "Low Attendance, Reasonable Academics" — Attendance issue despite decent marks
3. "Low Academics, Adequate Attendance" — Academic struggle despite attending classes
4. "Strong Overall Performance" — Performing well across available indicators
5. "Multiple Support Needs" — Struggling in several areas
6. "Insufficient Data" — Not enough data to classify

Precedence (evaluated in order):
1. Insufficient Data — checked first, needs minimum indicators
2. Multiple Support Needs — checked second (catches severe cases early)
3. Strong Overall — checked third (rewards strong students)
4. Specific segments — checked last (nuanced classification)
"""

import pandas as pd
import numpy as np


# ---------- Configurable Segment Thresholds ----------

SEGMENT_THRESHOLDS = {
    "academic_strong": 65,      # Above = strong academics
    "academic_low": 50,         # Below = low academics
    "attendance_good": 75,      # Above = reasonable/good attendance
    "attendance_low": 65,       # Below = low attendance
    "placement_low": 50,        # Below = low placement readiness
    "placement_good": 60,       # Above = adequate placement
    "overall_strong": 70,       # All indicators above this = strong overall
    "min_indicators": 2,        # Minimum indicators needed for classification
}


def classify_student(row: pd.Series) -> dict:
    """
    Classify a student into a segment.

    Returns dict with:
    - segment: str — segment name
    - reason: str — explanation for classification
    - priority: int — for sorting (lower = higher priority)
    """
    # Collect available indicators
    marks = row.get("avg_total_marks")
    attendance = row.get("attendance_percentage")
    placement_score = None
    success_score = row.get("success_score")

    # Calculate average placement from available sub-scores
    placement_cols = ["aptitude_score", "coding_score", "communication_score", "mock_interview_score"]
    placement_values = []
    for col in placement_cols:
        val = row.get(col)
        if pd.notna(val):
            placement_values.append(float(val))
    if placement_values:
        placement_score = sum(placement_values) / len(placement_values)

    has_marks = pd.notna(marks)
    has_attendance = pd.notna(attendance)
    has_placement = placement_score is not None

    indicator_count = sum([has_marks, has_attendance, has_placement])

    # --- Precedence-based classification ---

    # 1. Insufficient Data
    if indicator_count < SEGMENT_THRESHOLDS["min_indicators"]:
        return {
            "segment": "Insufficient Data",
            "reason": f"Only {indicator_count} indicator(s) available; need at least {SEGMENT_THRESHOLDS['min_indicators']} for classification",
            "priority": 6,
        }

    marks_val = float(marks) if has_marks else None
    att_val = float(attendance) if has_attendance else None

    # 2. Multiple Support Needs — at least 2 of 3 indicators below low thresholds
    low_count = 0
    low_areas = []
    if has_marks and marks_val < SEGMENT_THRESHOLDS["academic_low"]:
        low_count += 1
        low_areas.append(f"academics ({marks_val:.1f}%)")
    if has_attendance and att_val < SEGMENT_THRESHOLDS["attendance_low"]:
        low_count += 1
        low_areas.append(f"attendance ({att_val:.1f}%)")
    if has_placement and placement_score < SEGMENT_THRESHOLDS["placement_low"]:
        low_count += 1
        low_areas.append(f"placement ({placement_score:.1f})")

    if low_count >= 2:
        return {
            "segment": "Multiple Support Needs",
            "reason": f"Below thresholds in: {', '.join(low_areas)}",
            "priority": 5,
        }

    # 3. Strong Overall — all available indicators above strong thresholds
    all_strong = True
    strong_details = []
    if has_marks:
        if marks_val >= SEGMENT_THRESHOLDS["overall_strong"]:
            strong_details.append(f"academics ({marks_val:.1f}%)")
        else:
            all_strong = False
    if has_attendance:
        if att_val >= SEGMENT_THRESHOLDS["attendance_good"]:
            strong_details.append(f"attendance ({att_val:.1f}%)")
        else:
            all_strong = False
    if has_placement:
        if placement_score >= SEGMENT_THRESHOLDS["placement_good"]:
            strong_details.append(f"placement ({placement_score:.1f})")
        else:
            all_strong = False

    if all_strong and len(strong_details) >= 2:
        return {
            "segment": "Strong Overall Performance",
            "reason": f"Strong in: {', '.join(strong_details)}",
            "priority": 1,
        }

    # 4. Strong Academics, Low Placement
    if has_marks and has_placement:
        if marks_val >= SEGMENT_THRESHOLDS["academic_strong"] and placement_score < SEGMENT_THRESHOLDS["placement_low"]:
            return {
                "segment": "Strong Academics, Low Placement",
                "reason": f"Academics strong ({marks_val:.1f}%) but placement low ({placement_score:.1f})",
                "priority": 2,
            }

    # 5. Low Attendance, Reasonable Academics
    if has_attendance and has_marks:
        if att_val < SEGMENT_THRESHOLDS["attendance_low"] and marks_val >= SEGMENT_THRESHOLDS["academic_low"]:
            return {
                "segment": "Low Attendance, Reasonable Academics",
                "reason": f"Attendance low ({att_val:.1f}%) but academics adequate ({marks_val:.1f}%)",
                "priority": 3,
            }

    # 6. Low Academics, Adequate Attendance
    if has_marks and has_attendance:
        if marks_val < SEGMENT_THRESHOLDS["academic_low"] and att_val >= SEGMENT_THRESHOLDS["attendance_good"]:
            return {
                "segment": "Low Academics, Adequate Attendance",
                "reason": f"Academics low ({marks_val:.1f}%) despite good attendance ({att_val:.1f}%)",
                "priority": 4,
            }

    # Default: if no specific segment matches, classify based on overall trend
    if has_marks and marks_val >= SEGMENT_THRESHOLDS["academic_strong"]:
        return {
            "segment": "Strong Overall Performance",
            "reason": f"Generally performing well (academics: {marks_val:.1f}%)",
            "priority": 1,
        }

    # Fallback — student doesn't fit neatly into a specific segment
    return {
        "segment": "Needs Review",
        "reason": "Indicators mixed; does not fit a specific segment clearly",
        "priority": 3,
    }


def segment_all_students(df: pd.DataFrame) -> pd.DataFrame:
    """
    Classify all students into segments.
    Adds columns: segment, segment_reason, segment_priority
    """
    if df.empty:
        return df.copy()

    results = df.apply(classify_student, axis=1)

    segmented_df = df.copy()
    segmented_df["segment"] = [r["segment"] for r in results]
    segmented_df["segment_reason"] = [r["reason"] for r in results]
    segmented_df["segment_priority"] = [r["priority"] for r in results]

    return segmented_df


def get_segment_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Get a summary of segment counts with percentages."""
    if "segment" not in df.columns or df.empty:
        return pd.DataFrame(columns=["Segment", "Count", "Percentage"])

    counts = df["segment"].value_counts().reset_index()
    counts.columns = ["Segment", "Count"]
    counts["Percentage"] = (counts["Count"] / len(df) * 100).round(1)
    return counts.sort_values("Count", ascending=False)
