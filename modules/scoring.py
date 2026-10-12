"""
scoring.py — Student Success Score calculation engine.

Calculates a composite Student Success Score (0–100) using configurable,
weighted indicators. When data is missing, weights are dynamically
re-normalized across available indicators.

IMPORTANT: The Student Success Score is a prototype indicator for hackathon
demonstration purposes. It is NOT a validated predictive model and should
not be used as the sole basis for academic or placement decisions.

Design decisions:
- Scoring logic is completely separated from UI code
- All indicator normalization documented with assumptions
- Missing data results in weight re-normalization, not zero substitution
- If no valid indicators exist, score is None (unavailable), not 0
- Each indicator's contribution is transparent and explainable
"""

import pandas as pd
import numpy as np
from typing import Optional


# ---------- Default Weights (configurable) ----------

DEFAULT_WEIGHTS = {
    "academic": 0.25,      # 25% — Academic performance
    "attendance": 0.20,    # 20% — Attendance regularity
    "lms": 0.15,           # 15% — LMS and assignment completion
    "placement": 0.20,     # 20% — Placement readiness
    "skills": 0.10,        # 10% — Skills assessment
    "engagement": 0.10,    # 10% — Engagement and feedback
}


# ---------- Indicator Extraction ----------

def extract_academic_score(row: pd.Series) -> Optional[float]:
    """
    Extract academic indicator (0–100 scale).
    Uses avg_total_marks directly (already 0–100).
    """
    val = row.get("avg_total_marks")
    if pd.isna(val):
        return None
    return float(np.clip(val, 0, 100))


def extract_attendance_score(row: pd.Series) -> Optional[float]:
    """
    Extract attendance indicator (0–100 scale).
    Uses attendance_percentage directly.
    """
    val = row.get("attendance_percentage")
    if pd.isna(val):
        return None
    return float(np.clip(val, 0, 100))


def extract_lms_score(row: pd.Series) -> Optional[float]:
    """
    Extract LMS indicator (0–100 scale).
    Combines assignment completion rate (60%) and average assignment score (40%).
    If only one is available, uses that alone.
    """
    completion = row.get("assignment_completion_rate")
    avg_score = row.get("average_assignment_score")

    has_completion = pd.notna(completion)
    has_score = pd.notna(avg_score)

    if not has_completion and not has_score:
        return None

    if has_completion and has_score:
        return float(np.clip(completion, 0, 100)) * 0.6 + float(np.clip(avg_score, 0, 100)) * 0.4
    elif has_completion:
        return float(np.clip(completion, 0, 100))
    else:
        return float(np.clip(avg_score, 0, 100))


def extract_placement_score(row: pd.Series) -> Optional[float]:
    """
    Extract placement readiness indicator (0–100 scale).
    Average of available placement sub-scores (aptitude, coding, communication, mock interview).
    """
    cols = ["aptitude_score", "coding_score", "communication_score", "mock_interview_score"]
    values = []
    for col in cols:
        val = row.get(col)
        if pd.notna(val):
            values.append(float(np.clip(val, 0, 100)))

    if not values:
        return None
    return sum(values) / len(values)


def extract_skills_score(row: pd.Series) -> Optional[float]:
    """
    Extract skills indicator (0–100 scale).
    Normalizes avg_proficiency from 1–10 scale to 0–100.
    """
    val = row.get("avg_proficiency")
    if pd.isna(val):
        return None
    # Normalize 1–10 → 0–100
    normalized = (float(np.clip(val, 1, 10)) - 1) / 9 * 100
    return normalized


def extract_engagement_score(row: pd.Series) -> Optional[float]:
    """
    Extract engagement indicator (0–100 scale).
    Combines satisfaction_rating (50%) and peer_collaboration_score (50%),
    each normalized from 1–10 to 0–100.
    """
    satisfaction = row.get("satisfaction_rating")
    collaboration = row.get("peer_collaboration_score")

    has_sat = pd.notna(satisfaction)
    has_collab = pd.notna(collaboration)

    if not has_sat and not has_collab:
        return None

    def normalize_10(v):
        return (float(np.clip(v, 1, 10)) - 1) / 9 * 100

    if has_sat and has_collab:
        return normalize_10(satisfaction) * 0.5 + normalize_10(collaboration) * 0.5
    elif has_sat:
        return normalize_10(satisfaction)
    else:
        return normalize_10(collaboration)


# Map indicator names to extraction functions
INDICATOR_EXTRACTORS = {
    "academic": extract_academic_score,
    "attendance": extract_attendance_score,
    "lms": extract_lms_score,
    "placement": extract_placement_score,
    "skills": extract_skills_score,
    "engagement": extract_engagement_score,
}

INDICATOR_LABELS = {
    "academic": "Academic Performance",
    "attendance": "Attendance",
    "lms": "LMS & Assignments",
    "placement": "Placement Readiness",
    "skills": "Skills Assessment",
    "engagement": "Engagement & Feedback",
}


# ---------- Score Calculation ----------

def calculate_student_score(
    row: pd.Series,
    weights: Optional[dict[str, float]] = None,
) -> dict:
    """
    Calculate Student Success Score for a single student.

    Returns a dict with:
    - score: float (0–100) or None if no valid indicators
    - indicators: dict of indicator_name → value (0–100 or None)
    - effective_weights: dict of indicator_name → weight used (after normalization)
    - data_completeness: float (0–100), percentage of indicators with data
    - available_count: int, number of indicators with data
    - total_count: int, total number of indicators
    - strongest: str or None, name of strongest indicator
    - weakest: str or None, name of weakest indicator
    - contributions: dict of indicator_name → weighted contribution to score
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS.copy()

    # Extract all indicators
    indicators = {}
    for name, extractor in INDICATOR_EXTRACTORS.items():
        indicators[name] = extractor(row)

    # Determine available indicators
    available = {k: v for k, v in indicators.items() if v is not None}
    available_count = len(available)
    total_count = len(INDICATOR_EXTRACTORS)

    # Data completeness
    data_completeness = round(available_count / total_count * 100, 1) if total_count > 0 else 0.0

    # If no valid indicators, score is unavailable
    if available_count == 0:
        return {
            "score": None,
            "indicators": indicators,
            "effective_weights": {k: 0.0 for k in weights},
            "data_completeness": 0.0,
            "available_count": 0,
            "total_count": total_count,
            "strongest": None,
            "weakest": None,
            "contributions": {k: 0.0 for k in weights},
        }

    # Re-normalize weights for available indicators only
    available_weight_sum = sum(weights.get(k, 0) for k in available)
    effective_weights = {}
    for k in weights:
        if k in available and available_weight_sum > 0:
            effective_weights[k] = round(weights[k] / available_weight_sum, 4)
        else:
            effective_weights[k] = 0.0

    # Calculate weighted score
    contributions = {}
    score = 0.0
    for k, v in available.items():
        w = effective_weights.get(k, 0)
        contrib = v * w
        contributions[k] = round(contrib, 2)
        score += contrib

    # For unavailable indicators, contribution is 0
    for k in weights:
        if k not in available:
            contributions[k] = 0.0

    score = round(float(np.clip(score, 0, 100)), 1)

    # Strongest and weakest
    strongest = max(available, key=lambda k: available[k]) if available else None
    weakest = min(available, key=lambda k: available[k]) if available else None

    return {
        "score": score,
        "indicators": indicators,
        "effective_weights": effective_weights,
        "data_completeness": data_completeness,
        "available_count": available_count,
        "total_count": total_count,
        "strongest": strongest,
        "weakest": weakest,
        "contributions": contributions,
    }


def calculate_all_scores(
    df: pd.DataFrame,
    weights: Optional[dict[str, float]] = None,
) -> pd.DataFrame:
    """
    Calculate Student Success Scores for all students in the integrated DataFrame.

    Adds columns:
    - success_score: the composite score (0–100 or NaN)
    - data_completeness: percentage of indicators available
    - available_indicators: count of available indicators
    - strongest_indicator: name of strongest indicator
    - weakest_indicator: name of weakest indicator
    - Individual indicator scores: academic_score, attendance_score, etc.
    - Individual contributions: academic_contribution, etc.
    """
    if df.empty:
        return df.copy()

    results = df.apply(lambda row: calculate_student_score(row, weights), axis=1)

    scored_df = df.copy()
    scored_df["success_score"] = [r["score"] for r in results]
    scored_df["data_completeness"] = [r["data_completeness"] for r in results]
    scored_df["available_indicators"] = [r["available_count"] for r in results]
    scored_df["strongest_indicator"] = [r["strongest"] for r in results]
    scored_df["weakest_indicator"] = [r["weakest"] for r in results]

    # Individual indicator scores
    for indicator in INDICATOR_EXTRACTORS:
        scored_df[f"{indicator}_score_calc"] = [r["indicators"][indicator] for r in results]

    # Individual contributions
    for indicator in INDICATOR_EXTRACTORS:
        scored_df[f"{indicator}_contribution"] = [r["contributions"][indicator] for r in results]

    # Effective weights (same for all students with same available data)
    for indicator in INDICATOR_EXTRACTORS:
        scored_df[f"{indicator}_effective_weight"] = [r["effective_weights"][indicator] for r in results]

    return scored_df


def get_score_explanation(score_result: dict) -> list[str]:
    """
    Generate a human-readable explanation of how the score was calculated.
    Returns a list of explanation lines.
    """
    lines = []

    if score_result["score"] is None:
        lines.append("❌ Student Success Score is **unavailable** — no valid indicator data found.")
        lines.append("Upload additional data to calculate a score.")
        return lines

    lines.append(f"**Student Success Score: {score_result['score']}/100**")
    lines.append(f"Data completeness: {score_result['data_completeness']}% "
                 f"({score_result['available_count']}/{score_result['total_count']} indicators)")
    lines.append("")
    lines.append("**Score Breakdown:**")

    for indicator, label in INDICATOR_LABELS.items():
        value = score_result["indicators"][indicator]
        weight = score_result["effective_weights"][indicator]
        contrib = score_result["contributions"][indicator]

        if value is not None:
            lines.append(
                f"- {label}: {value:.1f}/100 × {weight:.1%} weight = {contrib:.1f} points"
            )
        else:
            lines.append(f"- {label}: No data available (weight redistributed)")

    if score_result["strongest"]:
        lines.append(f"\n💪 **Strongest:** {INDICATOR_LABELS[score_result['strongest']]}")
    if score_result["weakest"]:
        lines.append(f"⚠️ **Needs attention:** {INDICATOR_LABELS[score_result['weakest']]}")

    return lines
