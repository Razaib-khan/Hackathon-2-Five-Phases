"""
Password Hashing and Verification Utilities

Implements:
- bcrypt password hashing with cost factor 12
- Password verification against stored hash
- Password strength validation (min 8 chars, upper, lower, digit)

Security notes:
- Never store plaintext passwords
- bcrypt includes salt automatically
- Cost factor 12 balances security and performance
"""

import re

import bcrypt


class PasswordValidationError(Exception):
    """Raised when password doesn't meet strength requirements."""

    pass


def validate_password_strength(password: str) -> None:
    """
    Validate password meets minimum strength requirements.

    Requirements (per spec FR-002):
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit

    Args:
        password: Plain text password to validate

    Raises:
        PasswordValidationError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise PasswordValidationError("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        raise PasswordValidationError(
            "Password must contain at least one uppercase letter"
        )

    if not re.search(r"[a-z]", password):
        raise PasswordValidationError(
            "Password must contain at least one lowercase letter"
        )

    if not re.search(r"\d", password):
        raise PasswordValidationError("Password must contain at least one digit")


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt.

    Validates password strength before hashing.

    Args:
        password: Plain text password

    Returns:
        bcrypt hash string

    Raises:
        PasswordValidationError: If password doesn't meet strength requirements
    """
    # Validate strength first
    validate_password_strength(password)

    # Hash with bcrypt (cost factor 12)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify password against stored hash.

    Args:
        password: Plain text password to verify
        password_hash: Stored bcrypt hash

    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
