from datetime import timedelta, datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from ..models.user import User
from ..models.verification_code import VerificationCode, VerificationCodeType
from ..schemas.user import UserCreate, Token, UserRegister
from ..config.auth import create_access_token, get_password_hash, generate_verification_code
from .user_service import UserService
from .email_service import EmailService


class AuthService:
    @staticmethod
    def register_user(db: Session, user_data: UserRegister) -> dict:
        """Register a new user and send verification code"""
        # Check if user already exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        # Validate password confirmation
        if user_data.password != user_data.password_confirmation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )

        # Create a UserCreate object from UserRegister data
        user_create_data = UserCreate(
            email=user_data.email,
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            password=user_data.password,
            password_confirmation=user_data.password_confirmation,
            gdpr_consent=user_data.gdpr_consent,
            role=None,  # Default role will be set in UserService
            is_active=True,
            profile_image_url=None,
            bio=None,
            skills=None,
            email_confirmed=False,
            confirmation_token=None
        )

        # Create the user with email_confirmed=False initially
        db_user = UserService.create_user(db, user_create_data)

        # Generate a 6-digit verification code
        verification_code = generate_verification_code(6)

        # Save the verification code to the database
        code_entry = VerificationCode(
            user_id=db_user.id,
            code=verification_code,
            code_type=VerificationCodeType.EMAIL_VERIFICATION,
            expires_at=datetime.utcnow() + timedelta(minutes=10)  # Code expires in 10 minutes
        )
        db.add(code_entry)
        db.commit()

        # Send verification code via email
        try:
            EmailService.send_verification_code_email(
                to_email=db_user.email,
                username=db_user.first_name or db_user.username,
                verification_code=verification_code
            )
        except Exception as e:
            # Log the error but don't fail the registration
            print(f"Failed to send verification code email: {str(e)}")
            # Clean up the verification code entry if email fails
            db.delete(code_entry)
            db.commit()

        # Return a partial response with user info but without token
        # The user needs to verify the code before getting a token
        user_response = {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "role": db_user.role.value,
            "is_active": db_user.is_active,
            "profile_image_url": db_user.profile_image_url,
            "bio": db_user.bio,
            "skills": db_user.skills,
            "gdpr_consent": db_user.gdpr_consent,
            "email_confirmed": db_user.email_confirmed,
            "created_at": db_user.created_at,
            "updated_at": db_user.updated_at,
        }

        return {
            "user": user_response,
            "message": "User registered successfully. Please verify your email with the code sent to your email address."
        }

    @staticmethod
    def verify_registration_code(db: Session, user_id: UUID, code: str) -> Token:
        """Verify the registration code and complete user registration"""
        # Find the verification code entry
        verification_entry = db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.code == code,
            VerificationCode.code_type == VerificationCodeType.EMAIL_VERIFICATION,
            VerificationCode.expires_at > datetime.utcnow(),
            VerificationCode.used_at.is_(None)
        ).first()

        if not verification_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )

        # Mark the code as used
        verification_entry.used_at = datetime.utcnow()

        # Update user's email confirmation status
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.email_confirmed = True
            user.confirmed_at = datetime.utcnow()

        db.commit()

        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )

        # Prepare response
        user_response = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "is_active": user.is_active,
            "profile_image_url": user.profile_image_url,
            "bio": user.bio,
            "skills": user.skills,
            "gdpr_consent": user.gdpr_consent,
            "email_confirmed": user.email_confirmed,
            "confirmed_at": user.confirmed_at,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "last_login": user.last_login
        }

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    @staticmethod
    def initiate_login(db: Session, username_or_email: str) -> dict:
        """Initiate login process by sending verification code to user"""
        # Find the user by email or username
        db_user = UserService.get_user_by_email_or_username(db, username_or_email)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not db_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
            )

        # Generate a 6-digit verification code
        verification_code = generate_verification_code(6)

        # Save the verification code to the database
        code_entry = VerificationCode(
            user_id=db_user.id,
            code=verification_code,
            code_type=VerificationCodeType.EMAIL_VERIFICATION,  # For login verification
            expires_at=datetime.utcnow() + timedelta(minutes=10)  # Code expires in 10 minutes
        )
        db.add(code_entry)
        db.commit()

        # Send verification code via email
        try:
            EmailService.send_login_verification_code_email(
                to_email=db_user.email,
                username=db_user.first_name or db_user.username,
                verification_code=verification_code
            )
        except Exception as e:
            # Log the error but don't fail the login initiation
            print(f"Failed to send login verification code email: {str(e)}")
            # Clean up the verification code entry if email fails
            db.delete(code_entry)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification code"
            )

        # Return a response indicating the code has been sent
        return {
            "user_id": db_user.id,
            "message": "Verification code sent to your email. Please enter the code to complete login."
        }

    @staticmethod
    def verify_login_code(db: Session, user_id: UUID, code: str) -> Token:
        """Verify the login code and return authentication token"""
        # Find the verification code entry
        verification_entry = db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.code == code,
            VerificationCode.code_type == VerificationCodeType.EMAIL_VERIFICATION,
            VerificationCode.expires_at > datetime.utcnow(),
            VerificationCode.used_at.is_(None)
        ).first()

        if not verification_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )

        # Mark the code as used
        verification_entry.used_at = datetime.utcnow()

        # Get the user
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Update last login time
            user.last_login = datetime.utcnow()
            db.commit()

        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires
        )

        # Prepare response
        user_response = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value,
            "is_active": user.is_active,
            "profile_image_url": user.profile_image_url,
            "bio": user.bio,
            "skills": user.skills,
            "gdpr_consent": user.gdpr_consent,
            "email_confirmed": user.email_confirmed,
            "confirmed_at": user.confirmed_at,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "last_login": user.last_login
        }

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    @staticmethod
    def login_user(db: Session, username_or_email: str, password: str) -> Optional[Token]:
        """Authenticate user with username/email and password (for compatibility)"""
        # Authenticate the user
        db_user = UserService.authenticate_user(db, username_or_email, password)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username, email, or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last login time
        db_user.last_login = datetime.utcnow()
        db.commit()

        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": db_user.username},
            expires_delta=access_token_expires
        )

        # Prepare response
        user_response = {
            "id": db_user.id,
            "email": db_user.email,
            "username": db_user.username,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "role": db_user.role.value,
            "is_active": db_user.is_active,
            "profile_image_url": db_user.profile_image_url,
            "bio": db_user.bio,
            "skills": db_user.skills,
            "gdpr_consent": db_user.gdpr_consent,
            "email_confirmed": db_user.email_confirmed,
            "confirmed_at": db_user.confirmed_at,
            "created_at": db_user.created_at,
            "updated_at": db_user.updated_at,
            "last_login": db_user.last_login
        }

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )