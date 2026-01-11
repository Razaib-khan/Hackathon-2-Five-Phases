"""
JWT Token Verification Middleware

Implements:
- Token extraction from Authorization: Bearer <token> header
- JWT signature verification using PyJWT
- Token expiration enforcement
- FastAPI dependency injection pattern

Error codes:
- 401 Unauthorized: Missing/invalid/expired token
- 403 Forbidden: Valid token but user_id mismatch (handled in route handlers)
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "development-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 1


class TokenPayload:
    """JWT token payload structure."""

    def __init__(self, sub: str, email: str, exp: datetime):
        self.sub = sub  # user_id
        self.email = email
        self.exp = exp


def create_access_token(user_id: UUID, email: str) -> str:
    """
    Create a JWT access token for authenticated user.

    Args:
        user_id: User's UUID
        email: User's email address

    Returns:
        JWT token string
    """
    expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expires,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    Verify JWT token and extract user_id.

    This is a FastAPI dependency that can be injected into route handlers:
        async def handler(user_id: str = Depends(get_current_user))

    Args:
        token: JWT token from Authorization header

    Returns:
        user_id string from token's 'sub' claim

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: Optional[str] = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception


def verify_user_access(token_user_id: str, path_user_id: str) -> None:
    """
    Verify that the authenticated user matches the requested user_id.

    This enforces user isolation - users can only access their own resources.

    Args:
        token_user_id: user_id from JWT token
        path_user_id: user_id from request path

    Raises:
        HTTPException 403: If user_ids don't match
    """
    if token_user_id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You can only access your own resources",
        )
