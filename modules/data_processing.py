"""
data_processing.py — Data loading, validation, integration, and template generation.

Responsibilities:
- Load CSV files with column and data-type validation
- Detect duplicate student IDs
- Report missing values and data quality issues
- Integrate datasets using student_id as the join key
- Generate downloadable CSV templates
- Graceful handling of missing or empty files

Design decisions:
- Never silently replace missing values with zero
- Never double-count students after joins
- All validation errors are collected, not raised immediately
"""

import io
from typing import Optional
import pandas as pd
import numpy as np


# ---------- Schema definitions ----------

SCHEMAS = {
    "students": {
        "required_columns": ["student_id", "student_name", "department"],
        "optional_columns": ["semester", "email"],
        "numeric_columns": ["semester"],
        "ranges": {"semester": (1, 12)},
    },
    "academics": {
        "required_columns": ["student_id", "subject"],
        "optional_columns": ["internal_marks", "external_marks", "total_marks", "max_marks", "grade"],
        "numeric_columns": ["internal_marks", "external_marks", "total_marks", "max_marks"],
        "ranges": {
            "internal_marks": (0, 100),
            "external_marks": (0, 100),
            "total_marks": (0, 100),
            "max_marks": (1, 200),
        },
    },
    "attendance": {
        "required_columns": ["student_id"],
        "optional_columns": ["total_classes", "classes_attended", "attendance_percentage"],
        "numeric_columns": ["total_classes", "classes_attended", "attendance_percentage"],
        "ranges": {
            "total_classes": (0, 500),
            "classes_attended": (0, 500),
            "attendance_percentage": (0, 100),
        },
    },
    "lms": {
        "required_columns": ["student_id"],
        "optional_columns": [
            "total_assignments", "assignments_completed",
            "assignment_completion_rate", "average_assignment_score",
            "login_days", "resources_accessed",
        ],
        "numeric_columns": [
            "total_assignments", "assignments_completed",
            "assignment_completion_rate", "average_assignment_score",
            "login_days", "resources_accessed",
        ],
        "ranges": {
            "assignment_completion_rate": (0, 100),
            "average_assignment_score": (0, 100),
        },
    },
    "placement": {
        "required_columns": ["student_id"],
        "optional_columns": [
            "aptitude_score", "coding_score",
            "communication_score", "mock_interview_score",
        ],
        "numeric_columns": [
            "aptitude_score", "coding_score",
            "communication_score", "mock_interview_score",
        ],
        "ranges": {
            "aptitude_score": (0, 100),
            "coding_score": (0, 100),
            "communication_score": (0, 100),
            "mock_interview_score": (0, 100),
        },
    },
    "skills": {
        "required_columns": ["student_id", "skill_name"],
        "optional_columns": ["proficiency_level"],
        "numeric_columns": ["proficiency_level"],
        "ranges": {"proficiency_level": (1, 10)},
    },
    "engagement": {
        "required_columns": ["student_id"],
        "optional_columns": [
            "clubs_joined", "events_attended",
            "peer_collaboration_score", "satisfaction_rating", "feedback",
        ],
        "numeric_columns": [
            "clubs_joined", "events_attended",
            "peer_collaboration_score", "satisfaction_rating",
        ],
        "ranges": {
            "peer_collaboration_score": (1, 10),
            "satisfaction_rating": (1, 10),
        },
    },
}


# ---------- Validation ----------

class ValidationResult:
    """Collects validation warnings and errors for a dataset."""

    def __init__(self, dataset_name: str):
        self.dataset_name = dataset_name
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.row_count: int = 0
        self.column_count: int = 0
        self.missing_summary: dict[str, int] = {}
        self.duplicate_ids: list[str] = []
        self.is_valid: bool = True

    def add_error(self, msg: str):
        self.errors.append(msg)
        self.is_valid = False

    def add_warning(self, msg: str):
        self.warnings.append(msg)

    def summary_dict(self) -> dict:
        return {
            "dataset": self.dataset_name,
            "rows": self.row_count,
            "columns": self.column_count,
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "missing_values": self.missing_summary,
            "duplicate_ids": self.duplicate_ids,
        }


def validate_dataframe(df: pd.DataFrame, dataset_name: str) -> ValidationResult:
    """
    Validate a DataFrame against its schema definition.

    Checks:
    - Required columns exist
    - Numeric columns have correct dtype (or can be coerced)
    - Values are within defined ranges
    - Missing value counts
    - Duplicate student_id detection
    """
    result = ValidationResult(dataset_name)
    schema = SCHEMAS.get(dataset_name)

    if schema is None:
        result.add_warning(f"No schema defined for '{dataset_name}'. Skipping validation.")
        result.row_count = len(df)
        result.column_count = len(df.columns)
        return result

    result.row_count = len(df)
    result.column_count = len(df.columns)

    # Check required columns
    for col in schema["required_columns"]:
        if col not in df.columns:
            result.add_error(f"Missing required column: '{col}'")

    # Missing value summary
    for col in df.columns:
        missing = int(df[col].isna().sum())
        if missing > 0:
            result.missing_summary[col] = missing
            pct = round(missing / len(df) * 100, 1)
            result.add_warning(f"Column '{col}' has {missing} missing values ({pct}%)")

    # Numeric type validation and range checks
    for col in schema.get("numeric_columns", []):
        if col not in df.columns:
            continue
        # Try to coerce to numeric
        original_non_null = df[col].notna().sum()
        numeric_series = pd.to_numeric(df[col], errors="coerce")
        coerced_nulls = original_non_null - numeric_series.notna().sum()
        if coerced_nulls > 0:
            result.add_warning(
                f"Column '{col}': {coerced_nulls} values could not be converted to numeric"
            )

        # Range check
        if col in schema.get("ranges", {}):
            low, high = schema["ranges"][col]
            valid_vals = numeric_series.dropna()
            out_of_range = ((valid_vals < low) | (valid_vals > high)).sum()
            if out_of_range > 0:
                result.add_warning(
                    f"Column '{col}': {out_of_range} values outside expected range [{low}, {high}]"
                )

    # Duplicate student IDs
    if "student_id" in df.columns:
        # For datasets like academics/skills, duplicate student_id is expected (multiple rows per student)
        if dataset_name in ("students", "attendance", "lms", "placement", "engagement"):
            dupes = df[df["student_id"].duplicated(keep=False)]["student_id"].unique().tolist()
            if dupes:
                result.duplicate_ids = dupes[:10]  # Cap at 10 for display
                result.add_warning(
                    f"Found {len(dupes)} duplicate student_id(s): {dupes[:5]}..."
                    if len(dupes) > 5 else
                    f"Found {len(dupes)} duplicate student_id(s): {dupes}"
                )

    return result


def load_csv(file_or_path, dataset_name: str) -> tuple[Optional[pd.DataFrame], ValidationResult]:
    """
    Load a CSV from a file path or file-like object.
    Returns (DataFrame or None, ValidationResult).
    """
    result = ValidationResult(dataset_name)

    try:
        if isinstance(file_or_path, str):
            df = pd.read_csv(file_or_path)
        else:
            df = pd.read_csv(file_or_path)

        if df.empty:
            result.add_error(f"File for '{dataset_name}' is empty (0 rows).")
            return None, result

        validation = validate_dataframe(df, dataset_name)
        return df, validation

    except pd.errors.EmptyDataError:
        result.add_error(f"File for '{dataset_name}' contains no data.")
        return None, result
    except Exception as e:
        result.add_error(f"Error loading '{dataset_name}': {str(e)}")
        return None, result


# ---------- Data Integration ----------

def aggregate_academics(academics_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate subject-level academic data to student level.
    Returns one row per student with average marks and subject count.
    """
    if academics_df is None or academics_df.empty:
        return pd.DataFrame()

    agg = academics_df.groupby("student_id").agg(
        avg_total_marks=("total_marks", "mean"),
        avg_internal_marks=("internal_marks", "mean"),
        avg_external_marks=("external_marks", "mean"),
        subject_count=("subject", "count"),
        subjects_passed=("total_marks", lambda x: (x >= 40).sum()),
    ).reset_index()

    agg["avg_total_marks"] = agg["avg_total_marks"].round(1)
    agg["avg_internal_marks"] = agg["avg_internal_marks"].round(1)
    agg["avg_external_marks"] = agg["avg_external_marks"].round(1)
    return agg


def aggregate_skills(skills_df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate skill-level data to student level.
    Returns one row per student with average proficiency, skill count, and top skills.
    """
    if skills_df is None or skills_df.empty:
        return pd.DataFrame()

    agg = skills_df.groupby("student_id").agg(
        avg_proficiency=("proficiency_level", "mean"),
        skill_count=("skill_name", "count"),
        top_skills=("skill_name", lambda x: ", ".join(
            skills_df.loc[x.index].nlargest(3, "proficiency_level")["skill_name"].tolist()
        )),
    ).reset_index()

    agg["avg_proficiency"] = agg["avg_proficiency"].round(1)
    return agg


def integrate_datasets(datasets: dict[str, Optional[pd.DataFrame]]) -> pd.DataFrame:
    """
    Integrate all datasets into a single student-level DataFrame using left joins
    on student_id. The students table is the anchor.

    Never double-counts students. Aggregates multi-row datasets first.
    Never silently replaces missing values with zero.
    """
    students = datasets.get("students")
    if students is None or students.empty:
        return pd.DataFrame()

    merged = students.copy()

    # Aggregate multi-row datasets
    if datasets.get("academics") is not None and not datasets["academics"].empty:
        academics_agg = aggregate_academics(datasets["academics"])
        merged = merged.merge(academics_agg, on="student_id", how="left")

    if datasets.get("attendance") is not None and not datasets["attendance"].empty:
        merged = merged.merge(datasets["attendance"], on="student_id", how="left", suffixes=("", "_att"))

    if datasets.get("lms") is not None and not datasets["lms"].empty:
        merged = merged.merge(datasets["lms"], on="student_id", how="left", suffixes=("", "_lms"))

    if datasets.get("placement") is not None and not datasets["placement"].empty:
        merged = merged.merge(datasets["placement"], on="student_id", how="left", suffixes=("", "_plc"))

    if datasets.get("skills") is not None and not datasets["skills"].empty:
        skills_agg = aggregate_skills(datasets["skills"])
        merged = merged.merge(skills_agg, on="student_id", how="left", suffixes=("", "_sk"))

    if datasets.get("engagement") is not None and not datasets["engagement"].empty:
        merged = merged.merge(datasets["engagement"], on="student_id", how="left", suffixes=("", "_eng"))

    # Ensure no duplicate student_ids after merge
    if merged["student_id"].duplicated().any():
        merged = merged.drop_duplicates(subset="student_id", keep="first")

    return merged


# ---------- Templates ----------

TEMPLATES = {
    "students": pd.DataFrame({
        "student_id": ["STU0001", "STU0002"],
        "student_name": ["Example Student 1", "Example Student 2"],
        "department": ["Computer Science", "Electronics"],
        "semester": [5, 6],
        "email": ["student1@university.edu", "student2@university.edu"],
    }),
    "academics": pd.DataFrame({
        "student_id": ["STU0001", "STU0001", "STU0002"],
        "subject": ["Data Structures", "Algorithms", "Signal Processing"],
        "internal_marks": [35.0, 28.0, 32.0],
        "external_marks": [52.0, 45.0, 48.0],
        "total_marks": [87.0, 73.0, 80.0],
        "max_marks": [100, 100, 100],
        "grade": ["A+", "A", "A+"],
    }),
    "attendance": pd.DataFrame({
        "student_id": ["STU0001", "STU0002"],
        "total_classes": [100, 95],
        "classes_attended": [88, 72],
        "attendance_percentage": [88.0, 75.8],
    }),
    "lms": pd.DataFrame({
        "student_id": ["STU0001", "STU0002"],
        "total_assignments": [20, 22],
        "assignments_completed": [18, 15],
        "assignment_completion_rate": [90.0, 68.2],
        "average_assignment_score": [78.5, 62.0],
        "login_days": [45, 30],
        "resources_accessed": [38, 22],
    }),
    "placement": pd.DataFrame({
        "student_id": ["STU0001", "STU0002"],
        "aptitude_score": [72.0, 55.0],
        "coding_score": [68.0, 45.0],
        "communication_score": [80.0, 60.0],
        "mock_interview_score": [65.0, 50.0],
    }),
    "skills": pd.DataFrame({
        "student_id": ["STU0001", "STU0001", "STU0002"],
        "skill_name": ["Python", "SQL", "Java"],
        "proficiency_level": [8, 7, 6],
    }),
    "engagement": pd.DataFrame({
        "student_id": ["STU0001", "STU0002"],
        "clubs_joined": [2, 1],
        "events_attended": [5, 3],
        "peer_collaboration_score": [8, 6],
        "satisfaction_rating": [9, 7],
        "feedback": ["Great experience.", "Average experience."],
    }),
}


def get_template_csv(dataset_name: str) -> str:
    """Return CSV string for a template."""
    template = TEMPLATES.get(dataset_name)
    if template is None:
        return ""
    return template.to_csv(index=False)


def get_data_completeness(integrated_df: pd.DataFrame) -> dict:
    """
    Calculate data completeness metrics for the integrated dataset.
    Returns dict with overall and per-indicator completeness percentages.
    """
    if integrated_df.empty:
        return {"overall": 0.0, "indicators": {}}

    total_students = len(integrated_df)

    indicator_columns = {
        "Academic": "avg_total_marks",
        "Attendance": "attendance_percentage",
        "LMS": "assignment_completion_rate",
        "Placement (Aptitude)": "aptitude_score",
        "Placement (Coding)": "coding_score",
        "Skills": "avg_proficiency",
        "Engagement": "satisfaction_rating",
    }

    indicators = {}
    total_available = 0
    total_possible = 0

    for name, col in indicator_columns.items():
        if col in integrated_df.columns:
            available = int(integrated_df[col].notna().sum())
            indicators[name] = round(available / total_students * 100, 1)
            total_available += available
        else:
            indicators[name] = 0.0
        total_possible += total_students

    overall = round(total_available / total_possible * 100, 1) if total_possible > 0 else 0.0

    return {"overall": overall, "indicators": indicators}
