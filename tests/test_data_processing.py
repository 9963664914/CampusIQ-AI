"""
test_data_processing.py — Tests for data loading, validation, and integration.

Tests cover:
- Column validation and missing columns
- Duplicate ID detection
- Missing value handling
- Numeric range validation
- Data integration via joins
- Template generation
- Empty/invalid data handling
"""

import pytest
import pandas as pd
import numpy as np
import io
from modules.data_processing import (
    validate_dataframe, load_csv, integrate_datasets,
    aggregate_academics, aggregate_skills,
    get_template_csv, get_data_completeness,
)


# ---------- Validation Tests ----------

class TestValidation:
    def test_valid_students_data(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU002"],
            "student_name": ["Alice", "Bob"],
            "department": ["CS", "EC"],
            "semester": [5, 6],
        })
        result = validate_dataframe(df, "students")
        assert result.is_valid is True
        assert len(result.errors) == 0

    def test_missing_required_column(self):
        df = pd.DataFrame({
            "student_name": ["Alice"],
            "department": ["CS"],
        })
        result = validate_dataframe(df, "students")
        assert result.is_valid is False
        assert any("student_id" in e for e in result.errors)

    def test_duplicate_student_ids(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU001", "STU002"],
            "student_name": ["Alice", "Alice Dup", "Bob"],
            "department": ["CS", "CS", "EC"],
        })
        result = validate_dataframe(df, "students")
        assert len(result.duplicate_ids) > 0

    def test_missing_values_reported(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU002"],
            "total_classes": [100, np.nan],
            "classes_attended": [90, np.nan],
            "attendance_percentage": [90.0, np.nan],
        })
        result = validate_dataframe(df, "attendance")
        assert "total_classes" in result.missing_summary or "classes_attended" in result.missing_summary

    def test_out_of_range_values(self):
        df = pd.DataFrame({
            "student_id": ["STU001"],
            "attendance_percentage": [150.0],  # Out of range
            "total_classes": [100],
            "classes_attended": [90],
        })
        result = validate_dataframe(df, "attendance")
        assert any("attendance_percentage" in w for w in result.warnings)

    def test_numeric_conversion_warning(self):
        df = pd.DataFrame({
            "student_id": ["STU001"],
            "total_classes": ["not_a_number"],  # Invalid numeric
            "classes_attended": [90],
            "attendance_percentage": [90.0],
        })
        result = validate_dataframe(df, "attendance")
        assert any("could not be converted" in w for w in result.warnings)

    def test_unknown_dataset_schema(self):
        df = pd.DataFrame({"col1": [1, 2, 3]})
        result = validate_dataframe(df, "unknown_dataset")
        assert any("No schema" in w for w in result.warnings)

    def test_academics_allows_duplicate_ids(self):
        """Academic data has multiple rows per student (one per subject)."""
        df = pd.DataFrame({
            "student_id": ["STU001", "STU001", "STU002"],
            "subject": ["Math", "Science", "Math"],
            "total_marks": [80, 75, 60],
        })
        result = validate_dataframe(df, "academics")
        # Academics SHOULD allow duplicate student_ids (multiple subjects)
        assert len(result.duplicate_ids) == 0


# ---------- CSV Loading Tests ----------

class TestCSVLoading:
    def test_load_valid_csv(self, tmp_path):
        csv_file = tmp_path / "students.csv"
        csv_file.write_text("student_id,student_name,department\nSTU001,Alice,CS\n")
        df, validation = load_csv(str(csv_file), "students")
        assert df is not None
        assert len(df) == 1

    def test_load_empty_csv(self, tmp_path):
        csv_file = tmp_path / "empty.csv"
        csv_file.write_text("")
        df, validation = load_csv(str(csv_file), "students")
        assert df is None
        assert not validation.is_valid

    def test_load_from_file_like_object(self):
        csv_string = "student_id,student_name,department\nSTU001,Alice,CS\n"
        file_obj = io.StringIO(csv_string)
        df, validation = load_csv(file_obj, "students")
        assert df is not None
        assert len(df) == 1

    def test_load_headers_only(self, tmp_path):
        csv_file = tmp_path / "headers.csv"
        csv_file.write_text("student_id,student_name,department\n")
        df, validation = load_csv(str(csv_file), "students")
        assert df is None  # Empty after header


# ---------- Integration Tests ----------

class TestDataIntegration:
    def test_basic_integration(self):
        datasets = {
            "students": pd.DataFrame({
                "student_id": ["STU001", "STU002"],
                "student_name": ["Alice", "Bob"],
                "department": ["CS", "EC"],
            }),
            "attendance": pd.DataFrame({
                "student_id": ["STU001", "STU002"],
                "attendance_percentage": [90.0, 75.0],
                "total_classes": [100, 100],
                "classes_attended": [90, 75],
            }),
        }
        merged = integrate_datasets(datasets)
        assert len(merged) == 2
        assert "attendance_percentage" in merged.columns

    def test_no_duplicate_after_join(self):
        """Ensure joins don't create duplicate student rows."""
        datasets = {
            "students": pd.DataFrame({
                "student_id": ["STU001", "STU002"],
                "student_name": ["Alice", "Bob"],
                "department": ["CS", "EC"],
            }),
            "attendance": pd.DataFrame({
                "student_id": ["STU001"],
                "attendance_percentage": [90.0],
                "total_classes": [100],
                "classes_attended": [90],
            }),
        }
        merged = integrate_datasets(datasets)
        assert len(merged) == 2
        assert merged["student_id"].nunique() == 2

    def test_missing_dataset_graceful(self):
        datasets = {
            "students": pd.DataFrame({
                "student_id": ["STU001"],
                "student_name": ["Alice"],
                "department": ["CS"],
            }),
            "attendance": None,
            "academics": None,
        }
        merged = integrate_datasets(datasets)
        assert len(merged) == 1

    def test_empty_students_returns_empty(self):
        datasets = {"students": pd.DataFrame()}
        merged = integrate_datasets(datasets)
        assert merged.empty

    def test_no_students_returns_empty(self):
        datasets = {"attendance": pd.DataFrame({"student_id": ["STU001"], "attendance_percentage": [90]})}
        merged = integrate_datasets(datasets)
        assert merged.empty


# ---------- Aggregation Tests ----------

class TestAggregation:
    def test_academic_aggregation(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU001", "STU002"],
            "subject": ["Math", "Science", "Math"],
            "total_marks": [80.0, 70.0, 60.0],
            "internal_marks": [30.0, 25.0, 20.0],
            "external_marks": [50.0, 45.0, 40.0],
        })
        agg = aggregate_academics(df)
        assert len(agg) == 2
        # STU001: avg = (80+70)/2 = 75
        assert agg[agg["student_id"] == "STU001"]["avg_total_marks"].values[0] == 75.0

    def test_skills_aggregation(self):
        df = pd.DataFrame({
            "student_id": ["STU001", "STU001", "STU002"],
            "skill_name": ["Python", "SQL", "Java"],
            "proficiency_level": [8, 7, 6],
        })
        agg = aggregate_skills(df)
        assert len(agg) == 2
        assert agg[agg["student_id"] == "STU001"]["skill_count"].values[0] == 2


# ---------- Template Tests ----------

class TestTemplates:
    def test_template_exists(self):
        for name in ["students", "academics", "attendance", "lms", "placement", "skills", "engagement"]:
            csv = get_template_csv(name)
            assert len(csv) > 0
            # Should be valid CSV
            df = pd.read_csv(io.StringIO(csv))
            assert len(df) > 0

    def test_unknown_template(self):
        csv = get_template_csv("nonexistent")
        assert csv == ""


# ---------- Data Completeness Tests ----------

class TestDataCompleteness:
    def test_completeness_full_data(self):
        df = pd.DataFrame({
            "avg_total_marks": [80.0],
            "attendance_percentage": [90.0],
            "assignment_completion_rate": [85.0],
            "aptitude_score": [70.0],
            "coding_score": [65.0],
            "avg_proficiency": [7.0],
            "satisfaction_rating": [8.0],
        })
        result = get_data_completeness(df)
        assert result["overall"] == 100.0

    def test_completeness_partial_data(self):
        df = pd.DataFrame({
            "avg_total_marks": [80.0],
            "attendance_percentage": [np.nan],
        })
        result = get_data_completeness(df)
        assert result["overall"] < 100.0

    def test_completeness_empty(self):
        result = get_data_completeness(pd.DataFrame())
        assert result["overall"] == 0.0
