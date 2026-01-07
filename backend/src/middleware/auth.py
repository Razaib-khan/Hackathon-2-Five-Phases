from fastapi import HTTPException, status, Request
from fastapi.security.http import HTTPAuthorizationCredentials
from typing import Optional
import logging
from sqlmodel import select
from ..utils.auth import verify_token, get_current_user_from_token
from ..config.database import get_session
from ..models.user import User


logger = logging.getLogger(__name__)


class AuthMiddleware:
    """Authentication middleware to protect routes."""

    def __init__(self):
        pass

    async def authenticate_request(self, request: Request, token: str) -> Optional[User]:
        """
        Authenticate the request using the provided token.

        Args:
            request: FastAPI request object
            token: JWT token from Authorization header

        Returns:
            User object if authentication is successful, None otherwise
        """
        try:
            # Verify the token
            payload = verify_token(token)
            if payload is None:
                logger.warning(f"Invalid token provided for {request.url}")
                return None

            # Extract username from token
            username: str = payload.get("sub")
            if username is None:
                logger.warning(f"No username in token for {request.url}")
                return None

            # Get user from database
            for session in get_session():  # get_session() is a generator
                user = session.exec(select(User).where(User.username == username)).first()
                if user is None:
                    logger.warning(f"User not found for username: {username}")
                    return None

                # Check if user is active
                if not user.is_active:
                    logger.warning(f"Inactive user tried to access: {username}")
                    return None

                return user

        except Exception as e:
            logger.error(f"Error authenticating request: {e}")
            return None