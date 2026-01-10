from sqlmodel import Session, select
from typing import Optional
from ..models.user import User, UserBase
from ..models.session import Session as SessionModel
from ..models.password_reset_token import PasswordResetToken
from ..auth.auth_handler import auth_handler
from ..utils.errors import UserNotFoundException, UserAlreadyExistsException, InvalidCredentialsException, PasswordResetTokenExpiredException, PasswordResetTokenUsedException
from datetime import datetime, timedelta
from uuid import UUID
import uuid
from ..utils.logging import app_logger


class UserService:
    @staticmethod
    def create_user(session: Session, first_name: str, last_name: str, email: str, password: str) -> User:
        """Create a new user"""
        app_logger.info(f"Creating new user with email: {email}")

        # Check if user already exists
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            app_logger.warning(f"Attempt to create user with existing email: {email}")
            raise UserAlreadyExistsException()

        # Hash the password
        hashed_password = auth_handler.get_password_hash(password)

        # Create new user
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=hashed_password
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        app_logger.info(f"Successfully created user with ID: {user.id}")

        return user

    @staticmethod
    def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password"""
        app_logger.info(f"Authenticating user with email: {email}")

        user = session.exec(select(User).where(User.email == email)).first()

        if not user or not auth_handler.verify_password(password, user.password_hash):
            app_logger.warning(f"Failed authentication attempt for email: {email}")
            return None

        # Update last login time
        user.last_login = datetime.utcnow()
        session.add(user)
        session.commit()

        app_logger.info(f"Successfully authenticated user with ID: {user.id}")

        return user

    @staticmethod
    def get_user_by_id(session: Session, user_id: UUID) -> Optional[User]:
        """Get a user by ID"""
        return session.exec(select(User).where(User.id == user_id)).first()

    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """Get a user by email"""
        return session.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def update_user(
        session: Session,
        user_id: UUID,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        email: Optional[str] = None
    ) -> Optional[User]:
        """Update user information"""
        user = session.exec(select(User).where(User.id == user_id)).first()

        if not user:
            return None

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if email is not None:
            # Check if the new email is already taken by another user
            existing_user = session.exec(select(User).where(User.email == email).where(User.id != user_id)).first()
            if existing_user:
                raise UserAlreadyExistsException("Email already in use by another user")
            user.email = email

        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()
        session.refresh(user)

        return user

    @staticmethod
    def delete_user(session: Session, user_id: UUID) -> bool:
        """Delete a user (soft delete by deactivating)"""
        app_logger.info(f"Deactivating user with ID: {user_id}")

        user = session.exec(select(User).where(User.id == user_id)).first()

        if not user:
            app_logger.warning(f"Attempt to deactivate non-existent user with ID: {user_id}")
            return False

        user.is_active = False
        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()

        app_logger.info(f"Successfully deactivated user with ID: {user_id}")

        return True

    @staticmethod
    def activate_user(session: Session, user_id: UUID) -> bool:
        """Activate a user account"""
        user = session.exec(select(User).where(User.id == user_id)).first()

        if not user:
            return False

        user.is_active = True
        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()

        return True

    @staticmethod
    def verify_email(session: Session, user_id: UUID) -> bool:
        """Verify a user's email address"""
        user = session.exec(select(User).where(User.id == user_id)).first()

        if not user:
            return False

        user.email_verified = True
        user.updated_at = datetime.utcnow()

        session.add(user)
        session.commit()

        return True

    @staticmethod
    def initiate_password_reset(session: Session, email: str) -> Optional[UUID]:
        """Initiate password reset process by creating a reset token"""
        app_logger.info(f"Password reset initiated for email: {email}")

        user = session.exec(select(User).where(User.email == email)).first()

        if not user:
            # Return None to avoid leaking user information
            app_logger.info(f"Password reset requested for non-existent email: {email}")
            return None

        # Invalidate any existing reset tokens for this user
        existing_tokens = session.exec(
            select(PasswordResetToken).where(PasswordResetToken.user_id == user.id)
        ).all()

        for token in existing_tokens:
            session.delete(token)

        # Create a new reset token (valid for 10 minutes)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=str(uuid.uuid4()),
            expires_at=datetime.utcnow() + timedelta(minutes=10)  # 10-minute expiration
        )

        session.add(reset_token)
        session.commit()
        session.refresh(reset_token)

        app_logger.info(f"Password reset token created for user ID: {user.id}")

        return reset_token.id

    @staticmethod
    def reset_password(session: Session, token: str, new_password: str) -> bool:
        """Reset user password using a valid token"""
        app_logger.info("Processing password reset request")

        reset_token = session.exec(
            select(PasswordResetToken)
            .where(PasswordResetToken.token == token)
            .where(PasswordResetToken.expires_at > datetime.utcnow())
            .where(PasswordResetToken.used == False)
        ).first()

        if not reset_token:
            # Token doesn't exist, is expired, or already used
            app_logger.warning(f"Invalid or expired password reset token attempted: {token[:8]}...")
            return False

        # Get the user
        user = session.exec(select(User).where(User.id == reset_token.user_id)).first()
        if not user:
            app_logger.error(f"Password reset token linked to non-existent user ID: {reset_token.user_id}")
            return False

        # Update user's password
        user.password_hash = auth_handler.get_password_hash(new_password)
        user.updated_at = datetime.utcnow()

        # Mark the token as used
        reset_token.used = True

        session.add(user)
        session.add(reset_token)
        session.commit()

        app_logger.info(f"Password successfully reset for user ID: {user.id}")

        return True

    @staticmethod
    def validate_reset_token(session: Session, token: str) -> bool:
        """Validate if a reset token is valid and not expired"""
        reset_token = session.exec(
            select(PasswordResetToken)
            .where(PasswordResetToken.token == token)
            .where(PasswordResetToken.expires_at > datetime.utcnow())
            .where(PasswordResetToken.used == False)
        ).first()

        return reset_token is not None


class SessionService:
    @staticmethod
    def create_session(session: Session, user_id: UUID) -> SessionModel:
        """Create a new session for a user"""
        # Expire any existing sessions for this user
        existing_sessions = session.exec(
            select(SessionModel).where(SessionModel.user_id == user_id).where(SessionModel.is_active == True)
        ).all()

        for existing_session in existing_sessions:
            existing_session.is_active = False
            session.add(existing_session)

        # Create new session with 7-day timeout
        from ..config.settings import settings
        expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)

        session_obj = SessionModel(
            user_id=user_id,
            session_token=str(uuid.uuid4()),
            expires_at=expires_at
        )

        session.add(session_obj)
        session.commit()
        session.refresh(session_obj)

        return session_obj

    @staticmethod
    def get_session_by_token(session: Session, session_token: str) -> Optional[SessionModel]:
        """Get a session by its token"""
        return session.exec(
            select(SessionModel).where(SessionModel.session_token == session_token).where(SessionModel.is_active == True)
        ).first()

    @staticmethod
    def invalidate_session(session: Session, session_token: str) -> bool:
        """Invalidate a session (logout)"""
        session_obj = session.exec(
            select(SessionModel).where(SessionModel.session_token == session_token)
        ).first()

        if not session_obj:
            return False

        session_obj.is_active = False
        session.add(session_obj)
        session.commit()

        return True

    @staticmethod
    def invalidate_user_sessions(session: Session, user_id: UUID) -> int:
        """Invalidate all sessions for a user"""
        user_sessions = session.exec(
            select(SessionModel).where(SessionModel.user_id == user_id).where(SessionModel.is_active == True)
        ).all()

        count = 0
        for session_obj in user_sessions:
            session_obj.is_active = False
            session.add(session_obj)
            count += 1

        session.commit()
        return count

    @staticmethod
    def clean_expired_sessions(session: Session) -> int:
        """Remove expired sessions from the database"""
        expired_sessions = session.exec(
            select(SessionModel).where(SessionModel.expires_at < datetime.utcnow()).where(SessionModel.is_active == True)
        ).all()

        count = 0
        for expired_session in expired_sessions:
            expired_session.is_active = False
            session.add(expired_session)
            count += 1

        session.commit()
        return count