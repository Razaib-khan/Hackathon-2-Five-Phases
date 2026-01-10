from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from ..config.settings import settings
from ..models.user import User
from ..utils.errors import InvalidCredentialsException
from sqlmodel import Session, select
from ..database.database import get_session
import uuid


class AuthHandler:
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Hash a plain password"""
        return self.pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create an access token with expiration"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt

    def decode_token(self, token: str) -> dict:
        """Decode a token and return the payload"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise InvalidCredentialsException("Token has expired")
        except jwt.JWTError:
            raise InvalidCredentialsException("Could not validate credentials")

    def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security),
        session: Session = Depends(get_session)
    ) -> User:
        """Get the current authenticated user from the token"""
        token = credentials.credentials
        payload = self.decode_token(token)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise InvalidCredentialsException("Could not validate credentials")

        user = session.exec(select(User).where(User.id == uuid.UUID(user_id))).first()
        if user is None:
            raise InvalidCredentialsException("User not found")

        return user


# Global instance of AuthHandler
auth_handler = AuthHandler()