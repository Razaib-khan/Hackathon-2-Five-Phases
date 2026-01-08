from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from ..models.user import User
from ..utils.auth import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from ..models.schemas.user import UserCreate
from ..config.settings import settings
from ..utils.security import validate_password_strength


class AuthService:
    """Service class for handling authentication-related operations."""

    @staticmethod
    def authenticate_user(session: Session, username: str, password: str) -> Optional[User]:
        """
        Authenticate a user by username and password.

        Args:
            session: Database session
            username: Username to authenticate
            password: Plain text password

        Returns:
            User object if authentication is successful, None otherwise
        """
        user = session.exec(select(User).where(User.username == username)).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """
        Create an access token for a user.

        Args:
            user: User object

        Returns:
            Access token string
        """
        data = {"sub": user.username, "user_id": user.id}
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        return create_access_token(data=data, expires_delta=expires_delta)

    @staticmethod
    def create_refresh_token_for_user(user: User) -> str:
        """
        Create a refresh token for a user.

        Args:
            user: User object

        Returns:
            Refresh token string
        """
        data = {"sub": user.username, "user_id": user.id}
        expires_delta = timedelta(days=settings.refresh_token_expire_days)
        return create_refresh_token(data=data, expires_delta=expires_delta)

    @staticmethod
    def register_user(session: Session, user_data: UserCreate) -> User:
        """
        Register a new user.

        Args:
            session: Database session
            user_data: User creation data

        Returns:
            Created User object

        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username already exists
        existing_user = session.exec(select(User).where(User.username == user_data.username)).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )

        # Check if email already exists
        existing_email = session.exec(select(User).where(User.email == user_data.email)).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Validate password strength
        is_valid, error_msg = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # Create new user
        password_hash = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=password_hash,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=True,
            is_verified=False  # New users need to verify their email
        )

        try:
            session.add(db_user)
            session.commit()
            session.refresh(db_user)
            return db_user
        except IntegrityError:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already exists"
            )
        except Exception:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during registration"
            )

    @staticmethod
    def get_user_by_username(session: Session, username: str) -> Optional[User]:
        """
        Get a user by username.

        Args:
            session: Database session
            username: Username to search for

        Returns:
            User object if found, None otherwise
        """
        return session.exec(select(User).where(User.username == username)).first()

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """
        Get a user by email.

        Args:
            session: Database session
            email: Email to search for

        Returns:
            User object if found, None otherwise
        """
        return session.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def update_user_password(session: Session, user: User, new_password: str) -> User:
        """
        Update a user's password.

        Args:
            session: Database session
            user: User object to update
            new_password: New password

        Returns:
            Updated User object
        """
        # Validate password strength
        is_valid, error_msg = validate_password_strength(new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        user.hashed_password = get_password_hash(new_password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def verify_user(session: Session, user: User) -> User:
        """
        Verify a user's email.

        Args:
            session: Database session
            user: User object to verify

        Returns:
            Updated User object
        """
        user.is_verified = True
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def deactivate_user(session: Session, user: User) -> User:
        """
        Deactivate a user account.

        Args:
            session: Database session
            user: User object to deactivate

        Returns:
            Updated User object
        """
        user.is_active = False
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def activate_user(session: Session, user: User) -> User:
        """
        Activate a user account.

        Args:
            session: Database session
            user: User object to activate

        Returns:
            Updated User object
        """
        user.is_active = True
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """
        Verify a JWT token and return the payload.

        Args:
            token: JWT token to verify

        Returns:
            Token payload if valid, None otherwise
        """
        return verify_token(token)