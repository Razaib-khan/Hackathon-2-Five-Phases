from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from typing import Dict, Optional
from ..models.user import User, UserBase
from ..database.database import get_session
from ..auth.auth_handler import auth_handler
from ..services.auth_service import UserService
from ..services.email_service import email_service
from ..utils.errors import UserAlreadyExistsException, InvalidCredentialsException, PasswordResetTokenExpiredException, PasswordResetTokenUsedException
from ..config.settings import settings
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    confirm_password: str


class RegisterResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_new_password: str


class BetterAuthSignInRequest(BaseModel):
    email: str
    password: str
    callbackURL: Optional[str] = None


class BetterAuthSignUpRequest(BaseModel):
    email: str
    password: str
    name: str  # Better Auth typically sends name as a single field
    callbackURL: Optional[str] = None


class BetterAuthSessionResponse(BaseModel):
    session: Dict
    user: Dict


auth_router = APIRouter()


@auth_router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    # Check if passwords match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # Use UserService to create user
    user = UserService.create_user(
        session=session,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=request.password
    )

    return RegisterResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name
    )


@auth_router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    # Use UserService to authenticate user
    user = UserService.authenticate_user(
        session=session,
        email=request.email,
        password=request.password
    )

    if not user:
        raise InvalidCredentialsException()

    # Create access token
    token_data = {"sub": str(user.id)}
    access_token = auth_handler.create_access_token(data=token_data)

    return LoginResponse(access_token=access_token)


# Better Auth compatible endpoints
@auth_router.post("/auth/sign-in")
def better_auth_sign_in(request: BetterAuthSignInRequest, session: Session = Depends(get_session)):
    # Authenticate user
    user = UserService.authenticate_user(
        session=session,
        email=request.email,
        password=request.password
    )

    if not user:
        raise InvalidCredentialsException()

    # Create access token
    token_data = {"sub": str(user.id)}
    access_token = auth_handler.create_access_token(data=token_data)

    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    # Return session and user data in Better Auth format
    session_data = {
        "accessToken": access_token,
        "expiresAt": expires_at.isoformat() + "Z",  # ISO format with Z suffix for UTC
        "user": {
            "id": str(user.id),
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }

    return {
        "session": session_data,
        "user": session_data["user"]
    }


@auth_router.post("/auth/sign-up")
def better_auth_sign_up(request: BetterAuthSignUpRequest, session: Session = Depends(get_session)):
    # Check if user already exists
    existing_user = UserService.get_user_by_email(session, request.email)
    if existing_user:
        raise UserAlreadyExistsException()

    # Split the name into first and last name
    name_parts = request.name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # Create new user
    user = UserService.create_user(
        session=session,
        first_name=first_name,
        last_name=last_name,
        email=request.email,
        password=request.password
    )

    # Create access token
    token_data = {"sub": str(user.id)}
    access_token = auth_handler.create_access_token(data=token_data)

    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    # Return session and user data in Better Auth format
    session_data = {
        "accessToken": access_token,
        "expiresAt": expires_at.isoformat() + "Z",  # ISO format with Z suffix for UTC
        "user": {
            "id": str(user.id),
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }

    return {
        "session": session_data,
        "user": session_data["user"]
    }


@auth_router.post("/auth/sign-up/email")
def better_auth_sign_up_email(request: BetterAuthSignUpRequest, session: Session = Depends(get_session)):
    """Alternative endpoint for sign-up via email (matching Better Auth's expected pattern)"""
    # Check if user already exists
    existing_user = UserService.get_user_by_email(session, request.email)
    if existing_user:
        raise UserAlreadyExistsException()

    # Split the name into first and last name
    name_parts = request.name.split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # Create new user
    user = UserService.create_user(
        session=session,
        first_name=first_name,
        last_name=last_name,
        email=request.email,
        password=request.password
    )

    # Create access token
    token_data = {"sub": str(user.id)}
    access_token = auth_handler.create_access_token(data=token_data)

    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    # Return session and user data in Better Auth format
    session_data = {
        "accessToken": access_token,
        "expiresAt": expires_at.isoformat() + "Z",  # ISO format with Z suffix for UTC
        "user": {
            "id": str(user.id),
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        }
    }

    return {
        "session": session_data,
        "user": session_data["user"]
    }


@auth_router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(request: ForgotPasswordRequest, session: Session = Depends(get_session)):
    # Initiate password reset - this will return success regardless of whether user exists
    # to prevent user enumeration attacks
    user = UserService.get_user_by_email(session, request.email)
    token_id = UserService.initiate_password_reset(session, request.email)

    if token_id and user:
        # Construct the reset link
        reset_link = f"{settings.base_url}/auth/reset-password?token={token_id}"

        # Send password reset email
        try:
            email_service.send_password_reset_email(request.email, reset_link)
        except Exception as e:
            # Log the error but still return success to prevent user enumeration
            from ..utils.logging import app_logger
            app_logger.error(f"Failed to send password reset email to {request.email}: {str(e)}")

    # Always return success to prevent user enumeration
    return {"message": "If an account with that email exists, a password reset link has been sent."}


@auth_router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: ResetPasswordRequest, session: Session = Depends(get_session)):
    # Check if passwords match
    if request.new_password != request.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )

    # Attempt to reset the password using the token
    success = UserService.reset_password(session, request.token, request.new_password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    return {"message": "Password reset successfully"}


# Original API endpoints for frontend compatibility
@auth_router.post("/auth/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_original(request: RegisterRequest, session: Session = Depends(get_session)):
    # Check if passwords match
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # Use UserService to create user
    user = UserService.create_user(
        session=session,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        password=request.password
    )

    return RegisterResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name
    )


@auth_router.post("/auth/login", response_model=LoginResponse)
def login_original(request: LoginRequest, session: Session = Depends(get_session)):
    # Use UserService to authenticate user
    user = UserService.authenticate_user(
        session=session,
        email=request.email,
        password=request.password
    )

    if not user:
        raise InvalidCredentialsException()

    # Create access token
    token_data = {"sub": str(user.id)}
    access_token = auth_handler.create_access_token(data=token_data)

    return LoginResponse(access_token=access_token)


@auth_router.post("/auth/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password_original(request: ForgotPasswordRequest, session: Session = Depends(get_session)):
    # Initiate password reset - this will return success regardless of whether user exists
    # to prevent user enumeration attacks
    user = UserService.get_user_by_email(session, request.email)
    token_id = UserService.initiate_password_reset(session, request.email)

    if token_id and user:
        # Construct the reset link
        reset_link = f"{settings.base_url}/auth/reset-password?token={token_id}"

        # Send password reset email
        try:
            email_service.send_password_reset_email(request.email, reset_link)
        except Exception as e:
            # Log the error but still return success to prevent user enumeration
            from ..utils.logging import app_logger
            app_logger.error(f"Failed to send password reset email to {request.email}: {str(e)}")

    # Always return success to prevent user enumeration
    return {"message": "If an account with that email exists, a password reset link has been sent."}


@auth_router.post("/auth/reset-password", status_code=status.HTTP_200_OK)
def reset_password_original(request: ResetPasswordRequest, session: Session = Depends(get_session)):
    # Check if passwords match
    if request.new_password != request.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )

    # Attempt to reset the password using the token
    success = UserService.reset_password(session, request.token, request.new_password)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    return {"message": "Password reset successfully"}


# Better Auth compatible endpoints
@auth_router.get("/auth/get-session")
def get_session(request: Request, current_user: User = Depends(auth_handler.get_current_user)):
    """Better Auth compatible session endpoint"""
    # Calculate expiration time
    expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    # Return session and user data in Better Auth format
    session_data = {
        "accessToken": request.headers.get("authorization", "").replace("Bearer ", ""),
        "expiresAt": expires_at.isoformat() + "Z",  # ISO format with Z suffix for UTC
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "firstName": current_user.first_name,
            "lastName": current_user.last_name
        }
    }

    return {
        "session": session_data,
        "user": session_data["user"]
    }