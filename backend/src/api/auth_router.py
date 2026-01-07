from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import Dict, Any
from datetime import timedelta
from ..config.database import get_session
from ..models.user import User
from ..models.schemas.user import UserCreate, UserResponse
from ..services.auth_service import AuthService
from ..utils.auth import get_current_user_from_token
from ..config.settings import settings


router = APIRouter()


@router.post("/auth/register", response_model=UserResponse, summary="Register a new user")
async def register_user(
    user_data: UserCreate,
    session: Session = Depends(get_session)
) -> UserResponse:
    """
    Register a new user account.

    Args:
        user_data: User registration data
        session: Database session

    Returns:
        UserResponse object with the created user's information
    """
    try:
        user = AuthService.register_user(session, user_data)
        return UserResponse.from_orm(user)
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/auth/login", summary="User login")
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Authenticate user and return JWT tokens.

    Args:
        form_data: OAuth2 form data with username and password
        session: Database session

    Returns:
        Dictionary with access token, refresh token, and token type
    """
    user = AuthService.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access and refresh tokens
    access_token = AuthService.create_access_token_for_user(user)
    refresh_token = AuthService.create_refresh_token_for_user(user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60
    }


@router.post("/auth/refresh", summary="Refresh access token")
async def refresh_token(
    refresh_token: str,
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Refresh the access token using the refresh token.

    Args:
        refresh_token: Refresh token
        session: Database session

    Returns:
        Dictionary with new access token and token type
    """
    # Verify the refresh token
    payload = AuthService.verify_token(refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user info from the token
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = AuthService.get_user_by_username(session, username)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create new access token
    new_access_token = AuthService.create_access_token_for_user(user)

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60
    }


@router.post("/auth/logout", summary="User logout")
async def logout_user(
    current_user: User = Depends(get_current_user_from_token)
) -> Dict[str, str]:
    """
    Logout the current user.

    Args:
        current_user: Authenticated user

    Returns:
        Success message
    """
    # In a real implementation, you might want to invalidate the token
    # or add it to a blacklist for the remainder of its validity period
    return {"message": "Successfully logged out"}