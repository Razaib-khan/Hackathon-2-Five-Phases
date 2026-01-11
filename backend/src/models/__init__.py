"""
SQLModel ORM Models for AIDO Backend

Entities:
- User: Authenticated user with email/password
- Task: Todo item belonging to a user
"""

from .user import User
from .task import Task

__all__ = ["User", "Task"]
