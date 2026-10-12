"""
test_risk_and_segmentation.py — Tests for risk analysis and student segmentation.

Tests cover:
- Academic support classification
- Placement support classification
- Threshold boundary cases
- Insufficient data handling
- Segment assignment rules and precedence
- Batch assessment
"""

import pytest
import pandas as pd
import numpy as np
from modules.risk_analysis import (
    assess_academic_support, assess_placement_support,
    assess_all_students, get_risk_summary,
)
from modules.segmentation import (
    classify_student, segment_all_students, get_segment_summary,
)


# ---------- Academic Support Tests ----------

class TestAcademicSupport:
    def test_on_track(self):
        row = pd.Series({
            "avg_total_marks": 75.0,
            "attendance_percentage": 85.0,
            "assignment_completion_rate": 80.0,
        })
        result = assess_academic_support(row)
        assert result["status"] == "On Track"

    def test_support_recommended_multiple_concerns(self):
        row = pd.Series({
            "avg_total_marks": 35.0,  # Below 45
            "attendance_percentage": 55.0,  # Below 65
            "assignment_completion_rate": 40.0,  # Below 50
        })
        result = assess_academic_support(row)
        assert result["status"] == "Support Recommended"
        assert len(result["factors"]) >= 2

    def test_needs_review_single_concern(self):
        row = pd.Series({
            "avg_total_marks": 40.0,  # Below 45 → concern
            "attendance_percentage": 85.0,
            "assignment_completion_rate": 80.0,
        })
        result = assess_academic_support(row)
        assert result["status"] == "Needs Review"

    def test_needs_review_borderline(self):
        row = pd.Series({
            "avg_total_marks": 55.0,  # Borderline (below 60)
            "attendance_percentage": 72.0,  # Borderline (below 75)
            "assignment_completion_rate": 80.0,
        })
        result = assess_academic_support(row)
        assert result["status"] == "Needs Review"

    def test_insufficient_data(self):
        row = pd.Series({
            "avg_total_marks": np.nan,
            "attendance_percentage": np.nan,
            "assignment_completion_rate": np.nan,
        })
        result = assess_academic_support(row)
        assert result["status"] == "Insufficient Data"

    def test_factors_are_specific(self):
        row = pd.Series({
            "avg_total_marks": 30.0,
            "attendance_percentage": 50.0,
            "assignment_completion_rate": 80.0,
        })
        result = assess_academic_support(row)
        assert any("30.0" in f or "30" in f for f in result["factors"])
        assert any("50.0" in f or "50" in f for f in result["factors"])


# ---------- Placement Support Tests ----------

class TestPlacementSupport:
    def test_on_track(self):
        row = pd.Series({
            "aptitude_score": 70.0,
            "coding_score": 65.0,
            "communication_score": 75.0,
            "mock_interview_score": 60.0,
        })
        result = assess_placement_support(row)
        assert result["status"] == "On Track"

    def test_support_recommended(self):
        row = pd.Series({
            "aptitude_score": 30.0,  # Below 45
            "coding_score": 25.0,  # Below 40
            "communication_score": 60.0,
            "mock_interview_score": 50.0,
        })
        result = assess_placement_support(row)
        assert result["status"] == "Support Recommended"

    def test_insufficient_data(self):
        row = pd.Series({
            "aptitude_score": np.nan,
            "coding_score": np.nan,
            "communication_score": np.nan,
            "mock_interview_score": np.nan,
        })
        result = assess_placement_support(row)
        assert result["status"] == "Insufficient Data"


# ---------- Batch Assessment Tests ----------

class TestBatchAssessment:
    def test_batch_assessment(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU002"],
            "avg_total_marks": [80.0, 30.0],
            "attendance_percentage": [90.0, 50.0],
            "assignment_completion_rate": [85.0, 35.0],
            "aptitude_score": [70.0, 30.0],
            "coding_score": [65.0, 25.0],
            "communication_score": [75.0, 40.0],
            "mock_interview_score": [60.0, 35.0],
        })
        result = assess_all_students(df)
        assert "academic_support_status" in result.columns
        assert "placement_support_status" in result.columns
        assert len(result) == 2

    def test_risk_summary(self):
        df = pd.DataFrame({
            "academic_support_status": ["On Track", "Support Recommended", "On Track"],
            "placement_support_status": ["Needs Review", "On Track", "On Track"],
        })
        summary = get_risk_summary(df)
        assert summary["academic"]["On Track"] == 2
        assert summary["academic"]["Support Recommended"] == 1


# ---------- Segmentation Tests ----------

class TestSegmentation:
    def test_strong_overall(self):
        row = pd.Series({
            "avg_total_marks": 85.0,
            "attendance_percentage": 90.0,
            "aptitude_score": 75.0,
            "coding_score": 70.0,
            "communication_score": 80.0,
            "mock_interview_score": 65.0,
            "success_score": 80.0,
        })
        result = classify_student(row)
        assert result["segment"] == "Strong Overall Performance"

    def test_multiple_support_needs(self):
        row = pd.Series({
            "avg_total_marks": 30.0,
            "attendance_percentage": 40.0,
            "aptitude_score": 35.0,
            "coding_score": 30.0,
            "communication_score": 35.0,
            "mock_interview_score": 25.0,
            "success_score": 30.0,
        })
        result = classify_student(row)
        assert result["segment"] == "Multiple Support Needs"

    def test_strong_academics_low_placement(self):
        row = pd.Series({
            "avg_total_marks": 80.0,
            "attendance_percentage": 85.0,
            "aptitude_score": 30.0,
            "coding_score": 25.0,
            "communication_score": 35.0,
            "mock_interview_score": 30.0,
            "success_score": 50.0,
        })
        result = classify_student(row)
        assert result["segment"] == "Strong Academics, Low Placement"

    def test_low_attendance_reasonable_academics(self):
        row = pd.Series({
            "avg_total_marks": 65.0,
            "attendance_percentage": 50.0,
            "aptitude_score": 60.0,
            "coding_score": 55.0,
            "communication_score": 65.0,
            "mock_interview_score": 60.0,
            "success_score": 55.0,
        })
        result = classify_student(row)
        assert result["segment"] == "Low Attendance, Reasonable Academics"

    def test_insufficient_data(self):
        row = pd.Series({
            "avg_total_marks": np.nan,
            "attendance_percentage": 80.0,
            "aptitude_score": np.nan,
            "coding_score": np.nan,
            "communication_score": np.nan,
            "mock_interview_score": np.nan,
            "success_score": np.nan,
        })
        result = classify_student(row)
        assert result["segment"] == "Insufficient Data"

    def test_segment_has_reason(self):
        row = pd.Series({
            "avg_total_marks": 80.0,
            "attendance_percentage": 90.0,
            "aptitude_score": 70.0,
            "coding_score": 65.0,
            "communication_score": 75.0,
            "mock_interview_score": 60.0,
            "success_score": 75.0,
        })
        result = classify_student(row)
        assert len(result["reason"]) > 0


# ---------- Batch Segmentation Tests ----------

class TestBatchSegmentation:
    def test_segment_all(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU002"],
            "avg_total_marks": [85.0, 30.0],
            "attendance_percentage": [90.0, 40.0],
            "aptitude_score": [75.0, 25.0],
            "coding_score": [70.0, 20.0],
            "communication_score": [80.0, 30.0],
            "mock_interview_score": [65.0, 25.0],
            "success_score": [80.0, 25.0],
        })
        segmented = segment_all_students(df)
        assert "segment" in segmented.columns
        assert "segment_reason" in segmented.columns
        assert len(segmented) == 2

    def test_segment_summary(self):
        df = pd.DataFrame({
            "segment": ["Strong Overall Performance", "Multiple Support Needs",
                        "Strong Overall Performance"],
        })
        summary = get_segment_summary(df)
        assert len(summary) == 2
        assert "Percentage" in summary.columns

    def test_empty_dataframe(self):
        df = pd.DataFrame()
        segmented = segment_all_students(df)
        assert segmented.empty
