from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from ..models.user import User, UserRole
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..config.auth import get_password_hash, verify_password


class UserService:
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get a user by their ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get a user by their email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get a user by their username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_email_or_username(db: Session, email_or_username: str) -> Optional[User]:
        """Get a user by either their email or username"""
        user = db.query(User).filter(User.email == email_or_username).first()
        if not user:
            user = db.query(User).filter(User.username == email_or_username).first()
        return user

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user with email or username already exists
        existing_user = (
            db.query(User)
            .filter((User.email == user_data.email) | (User.username == user_data.username))
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )

        # Hash the password
        password_hash = get_password_hash(user_data.password)

        # Create the user object
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password_hash=password_hash,
            role=user_data.role if user_data.role else UserRole.PARTICIPANT,
            profile_image_url=user_data.profile_image_url,
            bio=user_data.bio,
            skills=str(user_data.skills) if user_data.skills else None,
            gdpr_consent=user_data.gdpr_consent,
            gdpr_consent_at=user_data.gdpr_consent if user_data.gdpr_consent else None,
            email_confirmed=user_data.email_confirmed,
            confirmation_token=user_data.confirmation_token
        )

        # Add to database
        db.add(db_user)
        try:
            db.commit()
            db.refresh(db_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )

        return db_user

    @staticmethod
    def update_user(db: Session, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update a user's profile"""
        db_user = db.query(User).filter(User.id == user_id).first()

        if not db_user:
            return None

        # Update fields that are provided
        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(db_user, field, value)

        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[User]:
        """Authenticate a user by username/email and password"""
        # Try to find user by username first, then by email
        user = db.query(User).filter(User.username == username_or_email).first()
        if not user:
            user = db.query(User).filter(User.email == username_or_email).first()

        if not user or not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def activate_user(db: Session, user_id: str) -> Optional[User]:
        """Activate a user account"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db_user.is_active = True
            db.commit()
            db.refresh(db_user)
        return db_user

    @staticmethod
    def deactivate_user(db: Session, user_id: str) -> Optional[User]:
        """Deactivate a user account"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            db_user.is_active = False
            db.commit()
            db.refresh(db_user)
        return db_user

    @staticmethod
    def generate_confirmation_token(db: Session, user_id: str) -> Optional[str]:
        """Generate a confirmation token for email verification"""
        import secrets
        import string
        from datetime import datetime

        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None

        # Generate a random confirmation token
        confirmation_token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
        db_user.confirmation_token = confirmation_token
        db.commit()
        db.refresh(db_user)

        return confirmation_token

    @staticmethod
    def confirm_email(db: Session, confirmation_token: str) -> Optional[User]:
        """Confirm user email using confirmation token"""
        from datetime import datetime

        db_user = db.query(User).filter(
            User.confirmation_token == confirmation_token,
            User.email_confirmed == False
        ).first()

        if not db_user:
            return None

        # Confirm the email
        db_user.email_confirmed = True
        db_user.confirmed_at = datetime.utcnow()
        db_user.confirmation_token = None  # Clear the token after confirmation
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def is_email_confirmed(db: Session, user_id: str) -> bool:
        """Check if user's email is confirmed"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        return db_user.email_confirmed