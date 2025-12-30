"""
API Router Module

Contains:
- auth: Authentication endpoints (register, login)
- tasks: Task CRUD endpoints
"""

from .auth import router as auth_router
from .tasks import router as tasks_router

__all__ = ["auth_router", "tasks_router"]
