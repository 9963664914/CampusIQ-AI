"""
test_scoring.py — Tests for the Student Success Score engine.

Tests cover:
- Complete and incomplete student records
- Missing indicators and unavailable scores
- Minimum and maximum score values
- Weight normalization
- Invalid/out-of-range data
- Score explanation generation
"""

import pytest
import pandas as pd
import numpy as np
from modules.scoring import (
    calculate_student_score, calculate_all_scores,
    get_score_explanation, DEFAULT_WEIGHTS,
    extract_academic_score, extract_attendance_score,
    extract_lms_score, extract_placement_score,
    extract_skills_score, extract_engagement_score,
)


# ---------- Fixtures ----------

@pytest.fixture
def complete_student():
    """A student with all indicators available."""
    return pd.Series({
        "student_id": "STU0001",
        "student_name": "Test Student",
        "department": "Computer Science",
        "avg_total_marks": 75.0,
        "attendance_percentage": 88.0,
        "assignment_completion_rate": 85.0,
        "average_assignment_score": 72.0,
        "aptitude_score": 68.0,
        "coding_score": 60.0,
        "communication_score": 72.0,
        "mock_interview_score": 55.0,
        "avg_proficiency": 7.5,
        "satisfaction_rating": 8.0,
        "peer_collaboration_score": 7.0,
    })


@pytest.fixture
def partial_student():
    """A student missing placement and skills data."""
    return pd.Series({
        "student_id": "STU0002",
        "student_name": "Partial Student",
        "department": "Electronics",
        "avg_total_marks": 55.0,
        "attendance_percentage": 70.0,
        "assignment_completion_rate": 60.0,
        "average_assignment_score": 50.0,
        "aptitude_score": np.nan,
        "coding_score": np.nan,
        "communication_score": np.nan,
        "mock_interview_score": np.nan,
        "avg_proficiency": np.nan,
        "satisfaction_rating": 6.0,
        "peer_collaboration_score": 5.0,
    })


@pytest.fixture
def empty_student():
    """A student with no indicator data."""
    return pd.Series({
        "student_id": "STU0003",
        "student_name": "Empty Student",
        "department": "Mechanical",
        "avg_total_marks": np.nan,
        "attendance_percentage": np.nan,
        "assignment_completion_rate": np.nan,
        "average_assignment_score": np.nan,
        "aptitude_score": np.nan,
        "coding_score": np.nan,
        "communication_score": np.nan,
        "mock_interview_score": np.nan,
        "avg_proficiency": np.nan,
        "satisfaction_rating": np.nan,
        "peer_collaboration_score": np.nan,
    })


@pytest.fixture
def perfect_student():
    """A student with maximum scores."""
    return pd.Series({
        "student_id": "STU0004",
        "student_name": "Perfect Student",
        "department": "Computer Science",
        "avg_total_marks": 100.0,
        "attendance_percentage": 100.0,
        "assignment_completion_rate": 100.0,
        "average_assignment_score": 100.0,
        "aptitude_score": 100.0,
        "coding_score": 100.0,
        "communication_score": 100.0,
        "mock_interview_score": 100.0,
        "avg_proficiency": 10.0,
        "satisfaction_rating": 10.0,
        "peer_collaboration_score": 10.0,
    })


@pytest.fixture
def minimum_student():
    """A student with minimum scores."""
    return pd.Series({
        "student_id": "STU0005",
        "student_name": "Minimum Student",
        "department": "Civil",
        "avg_total_marks": 0.0,
        "attendance_percentage": 0.0,
        "assignment_completion_rate": 0.0,
        "average_assignment_score": 0.0,
        "aptitude_score": 0.0,
        "coding_score": 0.0,
        "communication_score": 0.0,
        "mock_interview_score": 0.0,
        "avg_proficiency": 1.0,
        "satisfaction_rating": 1.0,
        "peer_collaboration_score": 1.0,
    })


# ---------- Individual Indicator Tests ----------

class TestIndicatorExtraction:
    def test_academic_score_valid(self):
        row = pd.Series({"avg_total_marks": 75.0})
        assert extract_academic_score(row) == 75.0

    def test_academic_score_missing(self):
        row = pd.Series({"avg_total_marks": np.nan})
        assert extract_academic_score(row) is None

    def test_academic_score_clamped(self):
        row = pd.Series({"avg_total_marks": 110.0})
        assert extract_academic_score(row) == 100.0

    def test_attendance_score_valid(self):
        row = pd.Series({"attendance_percentage": 88.5})
        assert extract_attendance_score(row) == 88.5

    def test_lms_score_both_available(self):
        row = pd.Series({"assignment_completion_rate": 80.0, "average_assignment_score": 70.0})
        expected = 80.0 * 0.6 + 70.0 * 0.4
        assert extract_lms_score(row) == pytest.approx(expected)

    def test_lms_score_only_completion(self):
        row = pd.Series({"assignment_completion_rate": 80.0, "average_assignment_score": np.nan})
        assert extract_lms_score(row) == 80.0

    def test_lms_score_both_missing(self):
        row = pd.Series({"assignment_completion_rate": np.nan, "average_assignment_score": np.nan})
        assert extract_lms_score(row) is None

    def test_placement_score_all_available(self):
        row = pd.Series({
            "aptitude_score": 60.0, "coding_score": 70.0,
            "communication_score": 80.0, "mock_interview_score": 50.0,
        })
        expected = (60 + 70 + 80 + 50) / 4
        assert extract_placement_score(row) == pytest.approx(expected)

    def test_placement_score_partial(self):
        row = pd.Series({
            "aptitude_score": 60.0, "coding_score": np.nan,
            "communication_score": 80.0, "mock_interview_score": np.nan,
        })
        expected = (60 + 80) / 2
        assert extract_placement_score(row) == pytest.approx(expected)

    def test_placement_score_none_available(self):
        row = pd.Series({
            "aptitude_score": np.nan, "coding_score": np.nan,
            "communication_score": np.nan, "mock_interview_score": np.nan,
        })
        assert extract_placement_score(row) is None

    def test_skills_score_normalization(self):
        # 1 → 0, 10 → 100
        row = pd.Series({"avg_proficiency": 5.5})
        expected = (5.5 - 1) / 9 * 100
        assert extract_skills_score(row) == pytest.approx(expected)

    def test_skills_score_max(self):
        row = pd.Series({"avg_proficiency": 10.0})
        assert extract_skills_score(row) == pytest.approx(100.0)

    def test_skills_score_min(self):
        row = pd.Series({"avg_proficiency": 1.0})
        assert extract_skills_score(row) == pytest.approx(0.0)

    def test_engagement_score_both(self):
        row = pd.Series({"satisfaction_rating": 8.0, "peer_collaboration_score": 6.0})
        sat_norm = (8.0 - 1) / 9 * 100
        collab_norm = (6.0 - 1) / 9 * 100
        expected = sat_norm * 0.5 + collab_norm * 0.5
        assert extract_engagement_score(row) == pytest.approx(expected)


# ---------- Score Calculation Tests ----------

class TestScoreCalculation:
    def test_complete_student_score(self, complete_student):
        result = calculate_student_score(complete_student)
        assert result["score"] is not None
        assert 0 <= result["score"] <= 100
        assert result["data_completeness"] == 100.0
        assert result["available_count"] == 6

    def test_partial_student_score(self, partial_student):
        result = calculate_student_score(partial_student)
        assert result["score"] is not None
        assert 0 <= result["score"] <= 100
        assert result["data_completeness"] < 100.0
        # Placement and skills missing → 4/6 indicators
        assert result["available_count"] == 4

    def test_empty_student_unavailable(self, empty_student):
        result = calculate_student_score(empty_student)
        assert result["score"] is None
        assert result["data_completeness"] == 0.0
        assert result["available_count"] == 0

    def test_perfect_student_max_score(self, perfect_student):
        result = calculate_student_score(perfect_student)
        assert result["score"] == 100.0

    def test_minimum_student_zero_score(self, minimum_student):
        result = calculate_student_score(minimum_student)
        assert result["score"] == 0.0

    def test_weight_normalization_partial(self, partial_student):
        """When some indicators are missing, effective weights should sum to ~1.0."""
        result = calculate_student_score(partial_student)
        available_weights = [
            w for k, w in result["effective_weights"].items()
            if result["indicators"].get(k) is not None
        ]
        assert sum(available_weights) == pytest.approx(1.0, abs=0.01)

    def test_weight_normalization_complete(self, complete_student):
        """When all indicators are available, effective weights should match defaults."""
        result = calculate_student_score(complete_student)
        for key, weight in DEFAULT_WEIGHTS.items():
            assert result["effective_weights"][key] == pytest.approx(weight, abs=0.01)

    def test_custom_weights(self, complete_student):
        """Custom weights should be used correctly."""
        custom_weights = {
            "academic": 0.50,
            "attendance": 0.10,
            "lms": 0.10,
            "placement": 0.10,
            "skills": 0.10,
            "engagement": 0.10,
        }
        result = calculate_student_score(complete_student, custom_weights)
        assert result["score"] is not None
        # Academic weight should be higher
        assert result["effective_weights"]["academic"] == pytest.approx(0.50, abs=0.01)

    def test_strongest_weakest(self, complete_student):
        result = calculate_student_score(complete_student)
        assert result["strongest"] is not None
        assert result["weakest"] is not None
        assert result["strongest"] != result["weakest"] or result["available_count"] == 1

    def test_contributions_sum_to_score(self, complete_student):
        result = calculate_student_score(complete_student)
        contrib_sum = sum(result["contributions"].values())
        assert contrib_sum == pytest.approx(result["score"], abs=0.5)


# ---------- Batch Score Tests ----------

class TestBatchScoring:
    def test_batch_scoring(self, complete_student, partial_student, empty_student):
        df = pd.DataFrame([complete_student, partial_student, empty_student])
        scored = calculate_all_scores(df)

        assert "success_score" in scored.columns
        assert "data_completeness" in scored.columns
        assert len(scored) == 3
        assert pd.notna(scored.iloc[0]["success_score"])
        assert pd.notna(scored.iloc[1]["success_score"])
        assert pd.isna(scored.iloc[2]["success_score"])

    def test_empty_dataframe(self):
        df = pd.DataFrame()
        scored = calculate_all_scores(df)
        assert scored.empty


# ---------- Explanation Tests ----------

class TestScoreExplanation:
    def test_explanation_complete(self, complete_student):
        result = calculate_student_score(complete_student)
        explanation = get_score_explanation(result)
        assert len(explanation) > 0
        assert any("Student Success Score" in line for line in explanation)

    def test_explanation_unavailable(self, empty_student):
        result = calculate_student_score(empty_student)
        explanation = get_score_explanation(result)
        assert any("unavailable" in line.lower() for line in explanation)

    def test_explanation_shows_weights(self, complete_student):
        result = calculate_student_score(complete_student)
        explanation = get_score_explanation(result)
        assert any("weight" in line.lower() for line in explanation)
