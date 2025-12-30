"""
Authentication Request/Response Schemas

Implements:
- UserRegisterRequest: Registration with email/password validation
- UserLoginRequest: Login credentials
- AuthResponse: JWT token response
- UserResponse: Public user data (no password_hash)
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """
    User registration request schema.

    Validates:
    - email: Valid email format
    - password: String (strength validation in service layer)
    """

    email: EmailStr = Field(
        ...,
        description="User email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (min 8 chars, must include uppercase, lowercase, digit)",
        examples=["SecurePass123"],
    )


class UserLoginRequest(BaseModel):
    """
    User login request schema.

    Note: FastAPI OAuth2PasswordRequestForm uses username/password,
    but we accept email/password for consistency.
    """

    email: EmailStr = Field(
        ...,
        description="User email address",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        description="User password",
        examples=["SecurePass123"],
    )


class AuthResponse(BaseModel):
    """
    Authentication response with JWT token.

    Returns:
    - access_token: JWT for Authorization header
    - token_type: Always "bearer"
    - user: Public user data
    """

    access_token: str = Field(
        ...,
        description="JWT access token",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type for Authorization header",
    )
    user: "UserResponse" = Field(
        ...,
        description="Authenticated user data",
    )


class UserResponse(BaseModel):
    """Public user data for API responses (excludes password_hash)."""

    id: UUID = Field(..., description="User UUID")
    email: str = Field(..., description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True


# Update forward reference
AuthResponse.model_rebuild()
