"""
Pydantic Schemas for Request/Response Validation

Components:
- auth: Registration and login schemas
- task: Task CRUD schemas
"""

from .auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserResponse,
)
from .task import (
    TaskCreateRequest,
    TaskUpdateRequest,
    TaskResponse,
    TaskListResponse,
)

__all__ = [
    "UserRegisterRequest",
    "UserLoginRequest",
    "AuthResponse",
    "UserResponse",
    "TaskCreateRequest",
    "TaskUpdateRequest",
    "TaskResponse",
    "TaskListResponse",
]
