"""
recommendations.py — Explainable, rule-based intervention recommendations.

Generates practical, actionable recommendations based on actual student data.
Each recommendation includes the specific reason it was triggered.

Does NOT use any LLM or fabricated explanations. All recommendations are
deterministic and traceable to specific data points.
"""

import pandas as pd
import numpy as np
from typing import Optional


# ---------- Recommendation Rules ----------

def generate_recommendations(row: pd.Series) -> list[dict]:
    """
    Generate recommendations for a single student based on their data.

    Returns list of dicts with:
    - category: str — type of recommendation
    - recommendation: str — specific action
    - reason: str — why this was recommended
    - priority: str — "High", "Medium", "Low"
    """
    recs = []

    # --- Attendance-based recommendations ---
    attendance = row.get("attendance_percentage")
    if pd.notna(attendance):
        attendance = float(attendance)
        if attendance < 50:
            recs.append({
                "category": "Attendance",
                "recommendation": "Immediate attendance follow-up: Schedule meeting with student and mentor to identify barriers to attendance.",
                "reason": f"Attendance critically low at {attendance:.1f}% (below 50%)",
                "priority": "High",
            })
        elif attendance < 65:
            recs.append({
                "category": "Attendance",
                "recommendation": "Attendance monitoring: Set up weekly check-ins to track and improve attendance.",
                "reason": f"Attendance low at {attendance:.1f}% (below 65%)",
                "priority": "High",
            })
        elif attendance < 75:
            recs.append({
                "category": "Attendance",
                "recommendation": "Attendance awareness: Notify student of attendance percentage and discuss improvement plan.",
                "reason": f"Attendance borderline at {attendance:.1f}% (below 75%)",
                "priority": "Medium",
            })

    # --- Academic performance recommendations ---
    marks = row.get("avg_total_marks")
    if pd.notna(marks):
        marks = float(marks)
        if marks < 40:
            recs.append({
                "category": "Academics",
                "recommendation": "Subject-specific tutoring: Arrange peer tutoring or faculty support for subjects with failing grades.",
                "reason": f"Average marks critically low at {marks:.1f}% (below passing threshold)",
                "priority": "High",
            })
        elif marks < 55:
            recs.append({
                "category": "Academics",
                "recommendation": "Academic support plan: Create a structured study schedule and connect with subject faculty for extra help.",
                "reason": f"Average marks below expected level at {marks:.1f}%",
                "priority": "High",
            })
        elif marks < 65:
            recs.append({
                "category": "Academics",
                "recommendation": "Academic improvement: Encourage participation in study groups and review additional learning resources.",
                "reason": f"Average marks moderate at {marks:.1f}% — room for improvement",
                "priority": "Medium",
            })

    # --- LMS/Assignment recommendations ---
    completion = row.get("assignment_completion_rate")
    avg_assignment = row.get("average_assignment_score")

    if pd.notna(completion):
        completion = float(completion)
        if completion < 50:
            recs.append({
                "category": "LMS & Assignments",
                "recommendation": "Assignment completion plan: Work with student to identify barriers and create a catch-up schedule for pending assignments.",
                "reason": f"Assignment completion rate critically low at {completion:.1f}%",
                "priority": "High",
            })
        elif completion < 70:
            recs.append({
                "category": "LMS & Assignments",
                "recommendation": "Assignment follow-up: Set reminders and check-ins for assignment deadlines.",
                "reason": f"Assignment completion rate below target at {completion:.1f}%",
                "priority": "Medium",
            })

    if pd.notna(avg_assignment):
        avg_assignment = float(avg_assignment)
        if avg_assignment < 50:
            recs.append({
                "category": "LMS & Assignments",
                "recommendation": "Assignment quality support: Review assignment submissions and provide targeted feedback for improvement.",
                "reason": f"Average assignment score low at {avg_assignment:.1f}%",
                "priority": "Medium",
            })

    # --- Placement readiness recommendations ---
    aptitude = row.get("aptitude_score")
    coding = row.get("coding_score")
    communication = row.get("communication_score")
    mock_interview = row.get("mock_interview_score")

    if pd.notna(aptitude) and float(aptitude) < 50:
        recs.append({
            "category": "Placement - Aptitude",
            "recommendation": "Aptitude practice: Enroll in quantitative aptitude and logical reasoning practice sessions.",
            "reason": f"Aptitude score low at {float(aptitude):.1f}",
            "priority": "Medium",
        })

    if pd.notna(coding) and float(coding) < 45:
        recs.append({
            "category": "Placement - Coding",
            "recommendation": "Coding exercises: Practice daily coding problems on platforms like HackerRank or LeetCode. Join coding bootcamp.",
            "reason": f"Coding score low at {float(coding):.1f}",
            "priority": "High",
        })
    elif pd.notna(coding) and float(coding) < 60:
        recs.append({
            "category": "Placement - Coding",
            "recommendation": "Coding practice: Regular problem-solving practice to improve technical skills.",
            "reason": f"Coding score below target at {float(coding):.1f}",
            "priority": "Medium",
        })

    if pd.notna(communication) and float(communication) < 50:
        recs.append({
            "category": "Placement - Communication",
            "recommendation": "Communication workshops: Participate in group discussions, presentations, and language labs.",
            "reason": f"Communication score low at {float(communication):.1f}",
            "priority": "Medium",
        })

    if pd.notna(mock_interview) and float(mock_interview) < 50:
        recs.append({
            "category": "Placement - Interview",
            "recommendation": "Mock interview practice: Schedule mock interviews with placement cell and receive structured feedback.",
            "reason": f"Mock interview score low at {float(mock_interview):.1f}",
            "priority": "High",
        })

    # --- Skills recommendations ---
    avg_proficiency = row.get("avg_proficiency")
    if pd.notna(avg_proficiency):
        avg_proficiency = float(avg_proficiency)
        if avg_proficiency < 4:
            recs.append({
                "category": "Skills",
                "recommendation": "Skill development: Identify key industry-relevant skills and enroll in focused training programs.",
                "reason": f"Average skill proficiency low at {avg_proficiency:.1f}/10",
                "priority": "Medium",
            })

    # --- Engagement recommendations ---
    satisfaction = row.get("satisfaction_rating")
    clubs = row.get("clubs_joined")
    events = row.get("events_attended")

    if pd.notna(satisfaction) and float(satisfaction) < 4:
        recs.append({
            "category": "Engagement",
            "recommendation": "Student wellness check: Low satisfaction may indicate challenges. Schedule a supportive conversation.",
            "reason": f"Satisfaction rating low at {float(satisfaction):.1f}/10",
            "priority": "Medium",
        })

    if pd.notna(clubs) and pd.notna(events):
        if int(clubs) == 0 and int(events) <= 1:
            recs.append({
                "category": "Engagement",
                "recommendation": "Campus engagement: Encourage participation in clubs, events, or peer activities.",
                "reason": "Minimal campus engagement — no clubs joined and very few events attended",
                "priority": "Low",
            })

    # --- Data quality recommendations ---
    data_completeness = row.get("data_completeness")
    if pd.notna(data_completeness) and float(data_completeness) < 50:
        recs.append({
            "category": "Data Quality",
            "recommendation": "Data verification: Significant data gaps for this student. Verify records and update missing information.",
            "reason": f"Data completeness only {float(data_completeness):.0f}% — score may not be representative",
            "priority": "Medium",
        })

    # Sort by priority
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recs.sort(key=lambda r: priority_order.get(r["priority"], 3))

    return recs


def generate_all_recommendations(df: pd.DataFrame) -> dict[str, list[dict]]:
    """
    Generate recommendations for all students.
    Returns dict mapping student_id to list of recommendations.
    """
    if df.empty:
        return {}

    all_recs = {}
    for _, row in df.iterrows():
        sid = row.get("student_id", "unknown")
        all_recs[sid] = generate_recommendations(row)

    return all_recs


def get_recommendation_summary(all_recs: dict[str, list[dict]]) -> dict:
    """
    Summarize recommendations across all students.
    Returns category-level counts and most common recommendations.
    """
    category_counts = {}
    priority_counts = {"High": 0, "Medium": 0, "Low": 0}
    students_with_recs = 0

    for sid, recs in all_recs.items():
        if recs:
            students_with_recs += 1
        for rec in recs:
            cat = rec["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1
            prio = rec["priority"]
            priority_counts[prio] = priority_counts.get(prio, 0) + 1

    return {
        "students_with_recommendations": students_with_recs,
        "total_students": len(all_recs),
        "category_counts": category_counts,
        "priority_counts": priority_counts,
    }
