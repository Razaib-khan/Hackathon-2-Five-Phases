from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..schemas.user import UserCreate, UserResponse, Token, UserLogin, UserRegister, VerifyCodeRequest, LoginVerificationRequest
from ..services.auth_service import AuthService
from ..services.user_service import UserService
from ..services.email_service import EmailService
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user with first name, last name, email, password, and password confirmation
    """
    # Check if GDPR consent is provided
    if not user_data.gdpr_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GDPR consent is required to register"
        )

    try:
        result = AuthService.register_user(db, user_data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during registration: {str(e)}"
        )


@router.post("/verify-registration", response_model=Token)
async def verify_registration(verification_data: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Verify the registration code sent to the user's email
    """
    try:
        token = AuthService.verify_registration_code(db, verification_data.user_id, verification_data.code)
        return token
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during verification: {str(e)}"
        )


@router.post("/initiate-login")
async def initiate_login(login_data: LoginVerificationRequest, db: Session = Depends(get_db)):
    """
    Initiate login by sending verification code to user's email
    """
    try:
        result = AuthService.initiate_login(db, login_data.username_or_email)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login initiation: {str(e)}"
        )


@router.post("/verify-login", response_model=Token)
async def verify_login(verification_data: VerifyCodeRequest, db: Session = Depends(get_db)):
    """
    Verify the login code and complete authentication
    """
    try:
        token = AuthService.verify_login_code(db, verification_data.user_id, verification_data.code)
        return token
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login verification: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Traditional login with username/email and password (for compatibility)
    """
    token = AuthService.login_user(db, form_data.username, form_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.post("/login-credentials", response_model=Token)
async def login_with_credentials(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with username/email and password (alternative endpoint)
    """
    token = AuthService.login_user(db, login_data.username_or_email, login_data.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user's profile
    """
    return current_user


@router.post("/confirm-email/{confirmation_token}")
async def confirm_email(confirmation_token: str, db: Session = Depends(get_db)):
    """
    Confirm user email using confirmation token (for backward compatibility)
    """
    user = UserService.confirm_email(db, confirmation_token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation token"
        )

    # Send welcome email after confirmation
    try:
        EmailService.send_welcome_email(user.email, user.username)
    except Exception:
        # Log the error but don't fail the confirmation
        print("Failed to send welcome email")

    return {"message": "Email confirmed successfully", "user": UserResponse.model_validate(user)}


@router.post("/resend-confirmation")
async def resend_confirmation(email: str, db: Session = Depends(get_db)):
    """
    Resend email confirmation to user
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.email_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already confirmed"
        )

    # Generate new confirmation token
    confirmation_token = UserService.generate_confirmation_token(db, str(user.id))

    # Send confirmation email
    try:
        EmailService.send_confirmation_email(
            to_email=user.email,
            username=user.username,
            confirmation_token=confirmation_token
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send confirmation email"
        )

    return {"message": "Confirmation email resent successfully"}