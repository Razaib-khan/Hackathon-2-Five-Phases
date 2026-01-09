from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserRole(str):
    PARTICIPANT = "participant"
    JUDGE = "judge"
    ADMIN = "admin"


class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.PARTICIPANT
    is_active: Optional[bool] = True
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    gdpr_consent: bool


class UserCreate(UserBase):
    password: str
    password_confirmation: str
    email_confirmed: Optional[bool] = False
    confirmation_token: Optional[str] = None


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None


class UserLogin(BaseModel):
    username_or_email: str
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: str
    password_confirmation: str
    gdpr_consent: bool


class VerifyCodeRequest(BaseModel):
    user_id: UUID
    code: str


class LoginVerificationRequest(BaseModel):
    username_or_email: str


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None
    email_confirmed: bool
    confirmed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None