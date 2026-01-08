from sqlmodel import Session, select
from typing import Optional, List
from uuid import UUID
from fastapi import HTTPException, status
from ..models.user import User
from ..models.schemas.user import UserCreate, UserUpdate, UserResponse
from ..utils.security import validate_password_strength, is_valid_email
from datetime import datetime


class UserService:
    """Service class for handling user-related operations."""

    @staticmethod
    def get_user_by_id(session: Session, user_id: UUID) -> Optional[User]:
        """
        Get a user by ID.

        Args:
            session: Database session
            user_id: User ID to search for

        Returns:
            User object if found, None otherwise
        """
        return session.get(User, user_id)

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
    def get_users(session: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """
        Get a list of users.

        Args:
            session: Database session
            skip: Number of users to skip
            limit: Maximum number of users to return

        Returns:
            List of User objects
        """
        return session.exec(select(User).offset(skip).limit(limit)).all()

    @staticmethod
    def create_user(session: Session, user_data: UserCreate) -> User:
        """
        Create a new user.

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

        # Validate email format
        if not is_valid_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Validate password strength
        is_valid, error_msg = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # Create new user
        from ..utils.auth import get_password_hash
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=True,
            is_verified=False  # New users need to verify their email
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    @staticmethod
    def update_user(session: Session, user_id: UUID, user_update: UserUpdate) -> Optional[User]:
        """
        Update a user.

        Args:
            session: Database session
            user_id: ID of user to update
            user_update: User update data

        Returns:
            Updated User object if successful, None if user not found
        """
        db_user = session.get(User, user_id)
        if not db_user:
            return None

        # Check if username is being changed and already exists
        if user_update.username and user_update.username != db_user.username:
            existing_user = session.exec(select(User).where(User.username == user_update.username)).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already registered"
                )

        # Check if email is being changed and already exists
        if user_update.email and user_update.email != db_user.email:
            existing_email = session.exec(select(User).where(User.email == user_update.email)).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )

            # Validate email format
            if not is_valid_email(user_update.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format"
                )

        # Update user fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)

        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    @staticmethod
    def delete_user(session: Session, user_id: UUID) -> bool:
        """
        Delete a user.

        Args:
            session: Database session
            user_id: ID of user to delete

        Returns:
            True if user was deleted, False if user not found
        """
        db_user = session.get(User, user_id)
        if not db_user:
            return False

        session.delete(db_user)
        session.commit()
        return True

    @staticmethod
    def activate_user(session: Session, user_id: UUID) -> Optional[User]:
        """
        Activate a user account.

        Args:
            session: Database session
            user_id: ID of user to activate

        Returns:
            Updated User object if successful, None if user not found
        """
        db_user = session.get(User, user_id)
        if not db_user:
            return None

        db_user.is_active = True
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    @staticmethod
    def deactivate_user(session: Session, user_id: UUID) -> Optional[User]:
        """
        Deactivate a user account.

        Args:
            session: Database session
            user_id: ID of user to deactivate

        Returns:
            Updated User object if successful, None if user not found
        """
        db_user = session.get(User, user_id)
        if not db_user:
            return None

        db_user.is_active = False
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    @staticmethod
    def verify_user(session: Session, user_id: int) -> Optional[User]:
        """
        Verify a user's email.

        Args:
            session: Database session
            user_id: ID of user to verify

        Returns:
            Updated User object if successful, None if user not found
        """
        db_user = session.get(User, user_id)
        if not db_user:
            return None

        db_user.is_verified = True
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user