from sqlmodel import SQLModel

# Import all models here to ensure they're registered with SQLModel
# This is needed for Alembic to detect the models for migrations
from .user import User
from .task import Task
from .session import Session
from .password_reset_token import PasswordResetToken

__all__ = ["SQLModel", "User", "Task", "Session", "PasswordResetToken"]