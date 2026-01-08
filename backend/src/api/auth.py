"""
Authentication API Endpoints

Implements:
- POST /auth/register: Create new user account
- POST /auth/login: Authenticate and receive JWT token

Security:
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens issued on successful auth
- Email uniqueness enforced at database level
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from ..config.database import get_session
from ..models.user import User
from ..schemas.auth import (
    AuthResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from ..security.jwt import create_access_token
from ..security.password import (
    PasswordValidationError,
    hash_password,
    verify_password,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Invalid password or validation error"},
        409: {"description": "Email already registered"},
    },
)
async def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_session),
) -> AuthResponse:
    """
    Register a new user account.

    Creates user with hashed password and returns JWT token.

    Args:
        request: Registration data (email, password)
        db: Database session

    Returns:
        AuthResponse with JWT token and user data

    Raises:
        HTTPException 400: Invalid password strength
        HTTPException 409: Email already exists
    """
    # Validate and hash password
    try:
        password_hash = hash_password(request.password)
    except PasswordValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Create user
    user = User(
        email=request.email,
        password_hash=password_hash,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Generate JWT token
    access_token = create_access_token(user.id, user.email)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
        ),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    },
)
async def login(
    request: UserLoginRequest,
    db: Session = Depends(get_session),
) -> AuthResponse:
    """
    Authenticate user and return JWT token.

    Verifies email/password and issues access token.

    Args:
        request: Login credentials (email, password)
        db: Database session

    Returns:
        AuthResponse with JWT token and user data

    Raises:
        HTTPException 401: Invalid email or password
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    user = db.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT token
    access_token = create_access_token(user.id, user.email)

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
        ),
    )
