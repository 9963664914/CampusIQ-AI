"""
report_export.py — CSV export and methodology summary generation.

Provides filtered, downloadable CSV exports and a methodology report
documenting scoring assumptions and limitations.
"""

import pandas as pd
import io
from typing import Optional
from modules.scoring import DEFAULT_WEIGHTS, INDICATOR_LABELS


# ---------- CSV Exports ----------

def export_unified_data(df: pd.DataFrame) -> str:
    """Export the unified student dataset as CSV string."""
    # Select available core columns
    core_cols = [
        "student_id", "student_name", "department", "semester", "email",
        "avg_total_marks", "attendance_percentage",
        "assignment_completion_rate", "average_assignment_score",
        "aptitude_score", "coding_score", "communication_score", "mock_interview_score",
        "avg_proficiency", "skill_count",
        "satisfaction_rating", "peer_collaboration_score",
    ]
    available_cols = [c for c in core_cols if c in df.columns]
    return df[available_cols].to_csv(index=False)


def export_scores(df: pd.DataFrame) -> str:
    """Export student scores with explanations as CSV string."""
    score_cols = [
        "student_id", "student_name", "department",
        "success_score", "data_completeness", "available_indicators",
        "strongest_indicator", "weakest_indicator",
    ]
    # Add individual indicator scores if present
    indicator_cols = [c for c in df.columns if c.endswith("_score_calc")]
    contribution_cols = [c for c in df.columns if c.endswith("_contribution")]

    available_cols = [c for c in score_cols + indicator_cols + contribution_cols if c in df.columns]
    return df[available_cols].to_csv(index=False)


def export_academic_support(df: pd.DataFrame, status_filter: Optional[list[str]] = None) -> str:
    """Export filtered academic support list as CSV."""
    cols = [
        "student_id", "student_name", "department", "semester",
        "avg_total_marks", "attendance_percentage", "assignment_completion_rate",
        "success_score", "academic_support_status", "academic_support_factors",
    ]
    available_cols = [c for c in cols if c in df.columns]
    export_df = df[available_cols].copy()

    if status_filter and "academic_support_status" in export_df.columns:
        export_df = export_df[export_df["academic_support_status"].isin(status_filter)]

    return export_df.to_csv(index=False)


def export_placement_support(df: pd.DataFrame, status_filter: Optional[list[str]] = None) -> str:
    """Export filtered placement support list as CSV."""
    cols = [
        "student_id", "student_name", "department", "semester",
        "aptitude_score", "coding_score", "communication_score", "mock_interview_score",
        "success_score", "placement_support_status", "placement_support_factors",
    ]
    available_cols = [c for c in cols if c in df.columns]
    export_df = df[available_cols].copy()

    if status_filter and "placement_support_status" in export_df.columns:
        export_df = export_df[export_df["placement_support_status"].isin(status_filter)]

    return export_df.to_csv(index=False)


# ---------- Methodology Report ----------

def generate_methodology_report(df: pd.DataFrame) -> str:
    """
    Generate a text summary of the scoring methodology, data completeness,
    assumptions, and limitations.
    """
    lines = []
    lines.append("=" * 60)
    lines.append("EDUPREDICT AI — METHODOLOGY & LIMITATIONS REPORT")
    lines.append("=" * 60)
    lines.append("")

    # Scoring methodology
    lines.append("## STUDENT SUCCESS SCORE METHODOLOGY")
    lines.append("")
    lines.append("The Student Success Score is a PROTOTYPE composite indicator")
    lines.append("calculated as a weighted average of normalized student metrics.")
    lines.append("It is NOT a validated predictive model.")
    lines.append("")
    lines.append("Default Weights:")
    for key, weight in DEFAULT_WEIGHTS.items():
        label = INDICATOR_LABELS.get(key, key)
        lines.append(f"  - {label}: {weight:.0%}")
    lines.append("")
    lines.append("Normalization:")
    lines.append("  - All indicators are normalized to a 0-100 scale")
    lines.append("  - When data is missing, weights of available indicators")
    lines.append("    are re-normalized (proportional redistribution)")
    lines.append("  - If NO indicators are available, score is 'Unavailable' (not 0)")
    lines.append("")

    # Risk assessment
    lines.append("## SUPPORT STATUS RULES")
    lines.append("")
    lines.append("Academic Support thresholds:")
    lines.append("  - Marks below 45%: Support concern")
    lines.append("  - Marks below 60%: Needs review")
    lines.append("  - Attendance below 65%: Support concern")
    lines.append("  - Attendance below 75%: Needs review")
    lines.append("  - Assignment completion below 50%: Support concern")
    lines.append("  - 2+ concerns → 'Support Recommended'")
    lines.append("  - 1 concern or 2+ borderline → 'Needs Review'")
    lines.append("")
    lines.append("Placement Support thresholds:")
    lines.append("  - Aptitude/Communication below 45: Support concern")
    lines.append("  - Coding/Mock Interview below 40: Support concern")
    lines.append("  - 2+ concerns → 'Support Recommended'")
    lines.append("")

    # Data completeness
    if not df.empty:
        lines.append("## DATA COMPLETENESS")
        lines.append(f"  Total students: {len(df)}")

        if "data_completeness" in df.columns:
            avg_comp = df["data_completeness"].mean()
            lines.append(f"  Average data completeness: {avg_comp:.1f}%")
            full_data = (df["data_completeness"] == 100).sum()
            lines.append(f"  Students with 100% data: {full_data}")

        if "success_score" in df.columns:
            scored = df["success_score"].notna().sum()
            lines.append(f"  Students with calculable score: {scored}")
        lines.append("")

    # Assumptions and limitations
    lines.append("## ASSUMPTIONS & LIMITATIONS")
    lines.append("")
    lines.append("1. This is a PROTOTYPE for hackathon demonstration only.")
    lines.append("2. Thresholds are configurable defaults, not validated cutoffs.")
    lines.append("3. Support labels indicate areas worth reviewing — they are")
    lines.append("   NOT predictions of academic failure or placement outcomes.")
    lines.append("4. Missing data affects score accuracy — always check")
    lines.append("   data completeness before acting on scores.")
    lines.append("5. Human review is essential before any intervention.")
    lines.append("6. Student data privacy must be respected at all times.")
    lines.append("7. Scores should not be used as sole basis for decisions.")
    lines.append("")

    return "\n".join(lines)
