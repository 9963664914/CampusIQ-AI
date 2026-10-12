"""
generate_sample_data.py — Deterministic synthetic data generator for EduPredict AI.

Generates CSV files for approximately 100 fictional students across multiple
data dimensions: demographics, academics, attendance, LMS activity, placement
assessments, skills, engagement, and feedback.

All data is deterministic (seeded random) so results are reproducible.
Student names and IDs are entirely fictional.
"""

import os
import numpy as np
import pandas as pd

SEED = 42
NUM_STUDENTS = 100

DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Information Technology"]
SEMESTERS = [3, 4, 5, 6]

FIRST_NAMES = [
    "Aarav", "Aditi", "Akash", "Ananya", "Arjun", "Bhavya", "Chetan", "Deepa",
    "Devika", "Dhruv", "Esha", "Farhan", "Gauri", "Harsh", "Isha", "Jai",
    "Kavya", "Kiran", "Lakshmi", "Manish", "Meera", "Nandini", "Nikhil", "Pallavi",
    "Priya", "Rahul", "Riya", "Rohit", "Sakshi", "Sanjay", "Shreya", "Sneha",
    "Suresh", "Tanvi", "Uday", "Varun", "Vidya", "Vikram", "Yash", "Zara",
    "Aditya", "Ankita", "Arnav", "Divya", "Gaurav", "Himani", "Ishaan", "Jaya",
    "Kartik", "Lavanya", "Mohit", "Neha", "Om", "Pooja", "Rajesh", "Sanya",
    "Tarun", "Uma", "Vivek", "Aishwarya", "Amit", "Charvi", "Daksh", "Ekta",
    "Faisal", "Gita", "Hemant", "Ira", "Jagdish", "Komal", "Lokesh", "Manju",
    "Naveen", "Omkar", "Pankaj", "Ritika", "Sahil", "Tanya", "Ujjwal", "Vani",
    "Aaditya", "Bharat", "Chandni", "Dinesh", "Fatima", "Girish", "Hema", "Irfan",
    "Janaki", "Kunal", "Lata", "Madhav", "Nisha", "Ojas", "Pratik", "Rekha",
    "Sameer", "Tulsi", "Umesh", "Vansh"
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Kumar", "Singh", "Gupta", "Joshi", "Verma",
    "Nair", "Rao", "Das", "Mehta", "Iyer", "Bhat", "Pillai", "Mishra",
    "Desai", "Chopra", "Malhotra", "Banerjee"
]

CS_SUBJECTS = ["Data Structures", "Algorithms", "DBMS", "Operating Systems", "Computer Networks"]
EC_SUBJECTS = ["Signal Processing", "Digital Electronics", "VLSI Design", "Communication Systems", "Microprocessors"]
ME_SUBJECTS = ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing", "Heat Transfer"]
CE_SUBJECTS = ["Structural Analysis", "Geotechnical Eng", "Surveying", "Concrete Design", "Transportation"]
IT_SUBJECTS = ["Web Technologies", "Cloud Computing", "Cyber Security", "Software Engineering", "Data Mining"]

DEPT_SUBJECTS = {
    "Computer Science": CS_SUBJECTS,
    "Electronics": EC_SUBJECTS,
    "Mechanical": ME_SUBJECTS,
    "Civil": CE_SUBJECTS,
    "Information Technology": IT_SUBJECTS,
}

SKILLS_LIST = [
    "Python", "Java", "SQL", "Problem Solving", "Communication",
    "Data Analysis", "Critical Thinking", "Teamwork", "Leadership", "Excel"
]


def generate_students(rng: np.random.Generator) -> pd.DataFrame:
    """Generate the master student records table."""
    student_ids = [f"STU{str(i+1).zfill(4)}" for i in range(NUM_STUDENTS)]
    first = [FIRST_NAMES[i % len(FIRST_NAMES)] for i in range(NUM_STUDENTS)]
    last = [LAST_NAMES[rng.integers(0, len(LAST_NAMES))] for _ in range(NUM_STUDENTS)]
    names = [f"{f} {l}" for f, l in zip(first, last)]
    departments = [DEPARTMENTS[rng.integers(0, len(DEPARTMENTS))] for _ in range(NUM_STUDENTS)]
    semesters = [int(SEMESTERS[rng.integers(0, len(SEMESTERS))]) for _ in range(NUM_STUDENTS)]
    emails = [f"{fn.lower()}.{ln.lower()}{sid[-3:]}@university.edu" for fn, ln, sid in zip(first, last, student_ids)]

    return pd.DataFrame({
        "student_id": student_ids,
        "student_name": names,
        "department": departments,
        "semester": semesters,
        "email": emails,
    })


def generate_academics(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate academic records with subject-wise marks."""
    rows = []
    for _, stu in students_df.iterrows():
        sid = stu["student_id"]
        dept = stu["department"]
        subjects = DEPT_SUBJECTS.get(dept, CS_SUBJECTS)

        # Create a student-level academic profile
        base = rng.normal(65, 15)
        for subj in subjects:
            internal = np.clip(rng.normal(base * 0.4, 5), 0, 40)
            external = np.clip(rng.normal(base * 0.6, 8), 0, 60)
            total = round(float(internal + external), 1)
            rows.append({
                "student_id": sid,
                "subject": subj,
                "internal_marks": round(float(internal), 1),
                "external_marks": round(float(external), 1),
                "total_marks": min(total, 100.0),
                "max_marks": 100,
                "grade": _marks_to_grade(total),
            })

    # Introduce ~5% missing values in internal/external marks
    df = pd.DataFrame(rows)
    mask = rng.random(len(df)) < 0.05
    df.loc[mask, "internal_marks"] = np.nan
    # Recalculate total where internal is missing
    df.loc[mask, "total_marks"] = df.loc[mask, "external_marks"]
    df.loc[mask, "grade"] = df.loc[mask, "total_marks"].apply(
        lambda x: _marks_to_grade(x) if pd.notna(x) else np.nan
    )
    return df


def _marks_to_grade(marks: float) -> str:
    if marks >= 90:
        return "O"
    elif marks >= 80:
        return "A+"
    elif marks >= 70:
        return "A"
    elif marks >= 60:
        return "B+"
    elif marks >= 50:
        return "B"
    elif marks >= 40:
        return "C"
    else:
        return "F"


def generate_attendance(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate attendance records."""
    rows = []
    for _, stu in students_df.iterrows():
        total_classes = int(rng.integers(80, 120))
        # Some students have high attendance, some low
        rate = np.clip(rng.beta(5, 2) * 100, 20, 100) / 100
        attended = int(total_classes * rate)
        rows.append({
            "student_id": stu["student_id"],
            "total_classes": total_classes,
            "classes_attended": attended,
            "attendance_percentage": round(attended / total_classes * 100, 1),
        })

    df = pd.DataFrame(rows)
    # ~3% missing attendance
    mask = rng.random(len(df)) < 0.03
    df.loc[mask, ["classes_attended", "attendance_percentage"]] = np.nan
    return df


def generate_lms(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate LMS activity data."""
    rows = []
    for _, stu in students_df.iterrows():
        total_assignments = int(rng.integers(15, 30))
        completion_rate = np.clip(rng.beta(4, 2), 0.1, 1.0)
        completed = int(total_assignments * completion_rate)
        avg_score = np.clip(rng.normal(70, 15), 0, 100)
        login_days = int(rng.integers(10, 90))
        resources_accessed = int(rng.integers(5, 80))
        rows.append({
            "student_id": stu["student_id"],
            "total_assignments": total_assignments,
            "assignments_completed": completed,
            "assignment_completion_rate": round(completed / total_assignments * 100, 1),
            "average_assignment_score": round(float(avg_score), 1),
            "login_days": login_days,
            "resources_accessed": resources_accessed,
        })

    df = pd.DataFrame(rows)
    mask = rng.random(len(df)) < 0.04
    df.loc[mask, ["assignments_completed", "assignment_completion_rate", "average_assignment_score"]] = np.nan
    return df


def generate_placement(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate placement assessment data."""
    rows = []
    for _, stu in students_df.iterrows():
        aptitude = np.clip(rng.normal(60, 18), 0, 100)
        coding = np.clip(rng.normal(55, 20), 0, 100)
        communication = np.clip(rng.normal(65, 15), 0, 100)
        mock_interview = np.clip(rng.normal(60, 18), 0, 100)
        rows.append({
            "student_id": stu["student_id"],
            "aptitude_score": round(float(aptitude), 1),
            "coding_score": round(float(coding), 1),
            "communication_score": round(float(communication), 1),
            "mock_interview_score": round(float(mock_interview), 1),
        })

    df = pd.DataFrame(rows)
    # ~8% missing — some students haven't taken placement tests
    for col in ["aptitude_score", "coding_score", "mock_interview_score"]:
        mask = rng.random(len(df)) < 0.08
        df.loc[mask, col] = np.nan
    return df


def generate_skills(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate skills assessment data."""
    rows = []
    for _, stu in students_df.iterrows():
        num_skills = int(rng.integers(3, len(SKILLS_LIST) + 1))
        chosen = rng.choice(SKILLS_LIST, size=num_skills, replace=False)
        for skill in chosen:
            proficiency = int(np.clip(rng.normal(6, 2), 1, 10))
            rows.append({
                "student_id": stu["student_id"],
                "skill_name": skill,
                "proficiency_level": proficiency,  # 1–10 scale
            })
    return pd.DataFrame(rows)


def generate_engagement(students_df: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    """Generate engagement and feedback data."""
    rows = []
    for _, stu in students_df.iterrows():
        clubs = int(rng.integers(0, 4))
        events = int(rng.integers(0, 10))
        peer_collab = int(np.clip(rng.normal(6, 2), 1, 10))
        satisfaction = int(np.clip(rng.normal(7, 2), 1, 10))
        feedback_text = _generate_feedback(rng, satisfaction)
        rows.append({
            "student_id": stu["student_id"],
            "clubs_joined": clubs,
            "events_attended": events,
            "peer_collaboration_score": peer_collab,
            "satisfaction_rating": satisfaction,
            "feedback": feedback_text,
        })

    df = pd.DataFrame(rows)
    mask = rng.random(len(df)) < 0.05
    df.loc[mask, "satisfaction_rating"] = np.nan
    return df


def _generate_feedback(rng: np.random.Generator, satisfaction: int) -> str:
    positive = [
        "Good learning environment.", "Helpful faculty.",
        "Enjoying the coursework.", "Great lab facilities.",
        "Supportive peers.", "Well-structured curriculum."
    ]
    neutral = [
        "Average experience.", "Could be improved.",
        "Some subjects need better teaching.", "Okay so far."
    ]
    negative = [
        "Need more practical sessions.", "Struggling with workload.",
        "Would like better placement support.", "Finding it challenging."
    ]
    if satisfaction >= 7:
        return str(rng.choice(positive))
    elif satisfaction >= 5:
        return str(rng.choice(neutral))
    else:
        return str(rng.choice(negative))


def generate_all(output_dir: str = "data") -> dict[str, pd.DataFrame]:
    """Generate all synthetic datasets and save to CSV files."""
    os.makedirs(output_dir, exist_ok=True)
    rng = np.random.default_rng(SEED)

    students = generate_students(rng)
    academics = generate_academics(students, rng)
    attendance = generate_attendance(students, rng)
    lms = generate_lms(students, rng)
    placement = generate_placement(students, rng)
    skills = generate_skills(students, rng)
    engagement = generate_engagement(students, rng)

    datasets = {
        "students": students,
        "academics": academics,
        "attendance": attendance,
        "lms": lms,
        "placement": placement,
        "skills": skills,
        "engagement": engagement,
    }

    for name, df in datasets.items():
        path = os.path.join(output_dir, f"{name}.csv")
        df.to_csv(path, index=False)
        print(f"  Generated {path}: {len(df)} rows, {len(df.columns)} columns")

    return datasets


if __name__ == "__main__":
    print("Generating synthetic data for EduPredict AI...")
    generate_all()
    print("Done.")
