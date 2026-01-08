"""
SQLModel ORM Models for AIDO Backend

Entities:
- User: Authenticated user with email/password
- Task: Todo item belonging to a user
- Tag: User-defined category label for tasks
- TaskTag: Junction table for task-tag many-to-many relationship
- Subtask: Checklist item within a parent task
- UserSettings: User preferences and configuration
- Role: User roles for permission system
- UserRoleLink: Junction table for user-role many-to-many relationship
"""

from .user import User
from .task import Task
from .tag import Tag
from .task_tag import TaskTag
from .subtask import Subtask
from .user_settings import UserSettings
from .role import Role, UserRoleLink

__all__ = ["User", "Task", "Tag", "TaskTag", "Subtask", "UserSettings", "Role", "UserRoleLink"]
