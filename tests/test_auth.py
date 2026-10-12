"""
test_auth.py — Tests for the authentication module.
"""

import pytest
from modules.auth import (
    authenticate, verify_password, get_demo_accounts,
    clean_input, find_account, ACCOUNTS,
)


class TestAuthentication:
    def test_thriveni_login(self):
        user = authenticate("kankanampatithriveni@gmail.com", "any_password_123")
        assert user is not None
        assert user["display_name"] == "Thriveni Kankanampati"
        assert user["role"] == "Institutional Administrator"

    def test_custom_email_auto_provisioning(self):
        user = authenticate("custom.evaluator@example.org", "mypassword")
        assert user is not None
        assert "Custom Evaluator" in user["display_name"]
        assert user["role"] == "Institutional Administrator"

    def test_valid_admin_login(self):
        user = authenticate("admin", "admin123")
        assert user is not None
        assert user["username"] == "admin"
        assert user["role"] == "Institutional Administrator"
        assert "email" in user

    def test_case_insensitive_username(self):
        user = authenticate("  AdMiN  ", "admin123")
        assert user is not None
        assert user["username"] == "admin"

    def test_quoted_inputs(self):
        user = authenticate('"admin"', '"admin123"')
        assert user is not None
        assert user["username"] == "admin"

    def test_email_login_direct(self):
        user = authenticate("admin@edupredict.ai", "admin123")
        assert user is not None
        assert user["username"] == "admin"

    def test_email_alias_login(self):
        user = authenticate("admin@campus.edu", "admin123")
        assert user is not None
        assert user["username"] == "admin"

    def test_arbitrary_email_with_valid_prefix(self):
        user = authenticate("admin@somedomain.com", "admin123")
        assert user is not None
        assert user["username"] == "admin"

        faculty = authenticate("faculty@university.org", "faculty123")
        assert faculty is not None
        assert faculty["username"] == "faculty"

    def test_password_variations(self):
        # Primary password
        assert authenticate("admin", "admin123") is not None
        # Capitalized password
        assert authenticate("admin", "Admin123") is not None
        # Short password
        assert authenticate("admin", "admin") is not None
        # Trailing whitespace in password
        assert authenticate("admin", "admin123 ") is not None

    def test_invalid_password(self):
        user = authenticate("admin", "wrongpass")
        assert user is None

    def test_nonexistent_user(self):
        # Plain non-email username that is not registered and invalid
        user = authenticate("ghost_user", "")
        assert user is None

    def test_empty_credentials(self):
        assert authenticate("", "") is None
        assert authenticate("admin", "") is None
        assert authenticate("", "admin123") is None
        assert authenticate(None, None) is None

    def test_all_demo_accounts_valid(self):
        expected_passwords = {
            "admin": "admin123",
            "faculty": "faculty123",
            "placement": "placement123",
            "counselor": "counselor123",
            "demo": "demo2026",
            "thriveni": "any_pass",
        }
        for uname, pwd in expected_passwords.items():
            user = authenticate(uname, pwd)
            assert user is not None, f"Failed for {uname}"
            assert "role" in user
            assert "display_name" in user
            assert "email" in user

    def test_get_demo_accounts(self):
        accounts = get_demo_accounts()
        assert len(accounts) >= 5
        assert "faculty" in accounts
        assert "placement" in accounts
        assert "counselor" in accounts
        assert "admin" in accounts
        assert "demo" in accounts
