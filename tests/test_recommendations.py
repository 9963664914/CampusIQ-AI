"""
test_recommendations.py — Tests for the recommendation engine.
"""

import pytest
import pandas as pd
import numpy as np
from modules.recommendations import (
    generate_recommendations, generate_all_recommendations,
    get_recommendation_summary,
)


class TestRecommendations:
    def test_low_attendance_generates_recommendation(self):
        row = pd.Series({
            "attendance_percentage": 45.0,
            "avg_total_marks": 70.0,
        })
        recs = generate_recommendations(row)
        assert any(r["category"] == "Attendance" for r in recs)

    def test_low_academics_generates_recommendation(self):
        row = pd.Series({
            "avg_total_marks": 35.0,
            "attendance_percentage": 85.0,
        })
        recs = generate_recommendations(row)
        assert any(r["category"] == "Academics" for r in recs)

    def test_low_coding_generates_recommendation(self):
        row = pd.Series({
            "coding_score": 30.0,
            "avg_total_marks": 70.0,
        })
        recs = generate_recommendations(row)
        assert any("Coding" in r["category"] for r in recs)

    def test_no_recommendations_for_strong_student(self):
        row = pd.Series({
            "avg_total_marks": 90.0,
            "attendance_percentage": 95.0,
            "assignment_completion_rate": 92.0,
            "average_assignment_score": 88.0,
            "aptitude_score": 85.0,
            "coding_score": 80.0,
            "communication_score": 82.0,
            "mock_interview_score": 78.0,
            "avg_proficiency": 8.0,
            "satisfaction_rating": 9.0,
            "peer_collaboration_score": 8.0,
            "clubs_joined": 2,
            "events_attended": 5,
            "data_completeness": 100.0,
        })
        recs = generate_recommendations(row)
        assert len(recs) == 0

    def test_recommendations_sorted_by_priority(self):
        row = pd.Series({
            "avg_total_marks": 30.0,
            "attendance_percentage": 40.0,
            "coding_score": 20.0,
            "assignment_completion_rate": 30.0,
        })
        recs = generate_recommendations(row)
        if len(recs) >= 2:
            priority_order = {"High": 0, "Medium": 1, "Low": 2}
            for i in range(len(recs) - 1):
                assert priority_order[recs[i]["priority"]] <= priority_order[recs[i + 1]["priority"]]

    def test_each_recommendation_has_reason(self):
        row = pd.Series({
            "avg_total_marks": 30.0,
            "attendance_percentage": 40.0,
        })
        recs = generate_recommendations(row)
        for rec in recs:
            assert "reason" in rec
            assert len(rec["reason"]) > 0

    def test_data_quality_recommendation(self):
        row = pd.Series({
            "data_completeness": 30.0,
            "avg_total_marks": 70.0,
        })
        recs = generate_recommendations(row)
        assert any(r["category"] == "Data Quality" for r in recs)

    def test_batch_recommendations(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU002"],
            "avg_total_marks": [30.0, 90.0],
            "attendance_percentage": [40.0, 95.0],
        })
        all_recs = generate_all_recommendations(df)
        assert "STU001" in all_recs
        assert "STU002" in all_recs
        assert len(all_recs["STU001"]) > 0

    def test_recommendation_summary(self):
        all_recs = {
            "STU001": [
                {"category": "Attendance", "recommendation": "...", "reason": "...", "priority": "High"},
                {"category": "Academics", "recommendation": "...", "reason": "...", "priority": "Medium"},
            ],
            "STU002": [],
        }
        summary = get_recommendation_summary(all_recs)
        assert summary["students_with_recommendations"] == 1
        assert summary["total_students"] == 2
        assert summary["category_counts"]["Attendance"] == 1
