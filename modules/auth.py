"""
auth.py — Authentication and Role-Based Access Control for EduPredict AI.

Provides credentials validation, role management, demo quick-login profiles,
normalization for usernames and emails, and flexible demo/user authentication.
"""

from typing import Optional, Dict, Any, List
import hashlib


def _hash(pwd: str) -> str:
    """Helper to generate SHA-256 hash."""
    return hashlib.sha256(pwd.encode("utf-8")).hexdigest()


# Demo and registered accounts tailored for institution stakeholders and hackathon evaluators
ACCOUNTS: Dict[str, Dict[str, Any]] = {
    "thriveni": {
        "primary_password": "admin123",
        "allow_any_password": True,
        "email": "kankanampatithriveni@gmail.com",
        "email_aliases": [
            "kankanampatithriveni@gmail.com",
            "kankanampatithriveni",
            "thriveni@campus.edu",
            "thriveni@edupredict.ai",
        ],
        "display_name": "Thriveni Kankanampati",
        "role": "Institutional Administrator",
        "department": "Campus IQ Core / KPMG HacXLerate",
        "icon": "👩‍🏫",
        "description": "Lead Administrator and Evaluator for EduPredict AI",
    },
    "admin": {
        "primary_password": "admin123",
        "password_hash": _hash("admin123"),
        "passwords": ["admin123", "Admin123", "admin", "Admin"],
        "password_hashes": [_hash(p) for p in ["admin123", "Admin123", "admin", "Admin"]],
        "email": "admin@edupredict.ai",
        "email_aliases": ["admin@campus.edu", "admin@kpmg.com", "admin@college.edu"],
        "display_name": "System Administrator",
        "role": "Institutional Administrator",
        "department": "Campus IQ Core",
        "icon": "🛡️",
        "description": "Full access to platform configuration, exports, and scoring parameters",
    },
    "faculty": {
        "primary_password": "faculty123",
        "password_hash": _hash("faculty123"),
        "passwords": ["faculty123", "Faculty123", "faculty", "Faculty"],
        "password_hashes": [_hash(p) for p in ["faculty123", "Faculty123", "faculty", "Faculty"]],
        "email": "faculty@edupredict.ai",
        "email_aliases": ["faculty@campus.edu", "faculty@kpmg.com", "priya.sharma@campus.edu"],
        "display_name": "Prof. Priya Sharma",
        "role": "Faculty Mentor",
        "department": "Computer Science & Engineering",
        "icon": "👨‍🏫",
        "description": "Academic advisor access for student intervention planning and tracking",
    },
    "placement": {
        "primary_password": "placement123",
        "password_hash": _hash("placement123"),
        "passwords": ["placement123", "Placement123", "placement", "Placement"],
        "password_hashes": [_hash(p) for p in ["placement123", "Placement123", "placement", "Placement"]],
        "email": "placement@edupredict.ai",
        "email_aliases": ["placement@campus.edu", "placement@kpmg.com", "rajesh.verma@campus.edu"],
        "display_name": "Dr. Rajesh Verma",
        "role": "Placement Officer",
        "department": "Corporate Relations & Placement Cell",
        "icon": "💼",
        "description": "Placement training coordinator monitoring skill & assessment readiness",
    },
    "counselor": {
        "primary_password": "counselor123",
        "password_hash": _hash("counselor123"),
        "passwords": ["counselor123", "Counselor123", "counselor", "Counselor"],
        "password_hashes": [_hash(p) for p in ["counselor123", "Counselor123", "counselor", "Counselor"]],
        "email": "counselor@edupredict.ai",
        "email_aliases": ["counselor@campus.edu", "counselor@kpmg.com", "ananya.iyer@campus.edu"],
        "display_name": "Ananya Iyer",
        "role": "Student Counselor",
        "department": "Student Welfare Cell",
        "icon": "🤝",
        "description": "Counseling access focused on attendance, wellbeing, and engagement",
    },
    "demo": {
        "primary_password": "demo2026",
        "password_hash": _hash("demo2026"),
        "passwords": ["demo2026", "Demo2026", "demo123", "demo", "Demo"],
        "password_hashes": [_hash(p) for p in ["demo2026", "Demo2026", "demo123", "demo", "Demo"]],
        "email": "demo@edupredict.ai",
        "email_aliases": ["demo@kpmg.com", "judge@kpmg.com", "evaluator@hacxlerate.com"],
        "display_name": "Hackathon Judge / Evaluator",
        "role": "KPMG HacXLerate Evaluator",
        "department": "Evaluation Jury",
        "icon": "⭐",
        "description": "Full review access to evaluate EduPredict AI features and insights",
    },
}


def clean_input(text: Optional[str]) -> str:
    """Strip leading/trailing whitespace, quotes, and newlines."""
    if not text:
        return ""
    return text.strip().strip("'\"").strip()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against SHA-256 hash.
    Tolerates leading/trailing accidental whitespace and quote copy-pastes.
    """
    if not plain_password or not hashed_password:
        return False

    candidates = [
        plain_password,
        plain_password.strip(),
        clean_input(plain_password),
    ]

    for candidate in candidates:
        if hashlib.sha256(candidate.encode("utf-8")).hexdigest() == hashed_password:
            return True
    return False


def find_account(identifier: str) -> Optional[tuple[str, Dict[str, Any]]]:
    """
    Find account by username, exact email, alias email, or email username prefix.
    Returns (username_key, account_dict) or None.
    """
    cleaned = clean_input(identifier).lower()
    if not cleaned:
        return None

    # 1. Direct username match
    if cleaned in ACCOUNTS:
        return cleaned, ACCOUNTS[cleaned]

    # 2. Match full email or alias
    for uname, acc in ACCOUNTS.items():
        if acc.get("email", "").lower() == cleaned:
            return uname, acc
        aliases = [a.lower() for a in acc.get("email_aliases", [])]
        if cleaned in aliases:
            return uname, acc

    # 3. Match email prefix (e.g., admin from admin@domain.com)
    if "@" in cleaned:
        prefix = cleaned.split("@")[0].strip()
        if prefix in ACCOUNTS:
            return prefix, ACCOUNTS[prefix]
        # Also check if prefix is in aliases
        for uname, acc in ACCOUNTS.items():
            aliases = [a.lower() for a in acc.get("email_aliases", [])]
            if prefix in aliases:
                return uname, acc

    return None


def authenticate(identifier: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user by username or email and password.
    Returns user profile dictionary if successful, None otherwise.
    Allows registered accounts and auto-provisions custom institutional emails.
    """
    if not identifier or not password:
        return None

    cleaned_id = clean_input(identifier)
    cleaned_pass = clean_input(password)
    if not cleaned_id or not cleaned_pass:
        return None

    # Check known registered accounts
    result = find_account(cleaned_id)
    if result:
        username, account = result

        # Account permits flexible login (e.g., project owner / lead evaluator)
        if account.get("allow_any_password", False):
            return {
                "username": username,
                "display_name": account["display_name"],
                "role": account["role"],
                "department": account["department"],
                "icon": account["icon"],
                "email": account.get("email", cleaned_id),
            }

        valid_hashes: List[str] = list(account.get("password_hashes", []))
        primary_hash = account.get("password_hash")
        if primary_hash and primary_hash not in valid_hashes:
            valid_hashes.append(primary_hash)

        # Check password against allowed hashes
        for h in valid_hashes:
            if verify_password(password, h):
                return {
                    "username": username,
                    "display_name": account["display_name"],
                    "role": account["role"],
                    "department": account["department"],
                    "icon": account["icon"],
                    "email": account.get("email", f"{username}@edupredict.ai"),
                }

        # If a recognized static demo account had an incorrect password:
        return None

    # Dynamic auto-provisioning for any valid custom email address
    # (e.g., user entering their personal or college email address)
    if "@" in cleaned_id and len(cleaned_pass) >= 1:
        prefix = cleaned_id.split("@")[0].strip()
        formatted_name = prefix.replace(".", " ").replace("_", " ").title()
        return {
            "username": prefix.lower(),
            "display_name": formatted_name,
            "role": "Institutional Administrator",
            "department": "Campus IQ Core / Lead Evaluator",
            "icon": "👩‍🏫",
            "email": cleaned_id,
        }

    return None


def get_demo_accounts() -> Dict[str, Dict[str, Any]]:
    """Return list of demo accounts for quick-login preview."""
    return ACCOUNTS
