"""
Task SQLModel Entity

Represents a todo item belonging to a user with:
- id: UUID primary key
- user_id: Foreign key to users table
- title: Required, max 200 chars
- description: Optional, max 1000 chars
- completed: Boolean, defaults to false
- priority: High/Medium/Low/None (FR-001)
- due_date: Optional deadline (FR-011)
- status: To Do/In Progress/Done for Kanban (FR-026)
- time_spent: Accumulated minutes tracked (FR-064)
- custom_order: User-defined position (FR-044)
- recurrence_pattern: Daily/Weekly/Monthly config (FR-072)
- version: Optimistic locking version (FR-103)
- created_at, updated_at: timestamps

Relationships:
- user: Many-to-one relationship with User
- tags: Many-to-many relationship with Tag
- subtasks: One-to-many relationship with Subtask

Indexes:
- user_id: For filtering tasks by user
- (user_id, created_at): For efficient task list queries with ordering
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional, Dict, Any, List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel, Index, Column
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .user import User
    from .task_tag import TaskTag
    from .subtask import Subtask


class Task(SQLModel, table=True):
    """Task entity for todo items."""

    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_user_id_created_at", "user_id", "created_at"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)

    # New fields for advanced features (Phase 1 migrations)
    priority: str = Field(default="none", max_length=10)  # high/medium/low/none
    due_date: Optional[datetime] = Field(default=None)
    status: str = Field(default="todo", max_length=20)  # todo/in_progress/done
    time_spent: int = Field(default=0)  # minutes tracked
    custom_order: Optional[int] = Field(default=None)  # user-defined position
    recurrence_pattern: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))  # JSONB config
    version: int = Field(default=1)  # optimistic locking

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tasks")
    task_tags: List["TaskTag"] = Relationship(back_populates="task")
    subtasks: List["Subtask"] = Relationship(back_populates="task", cascade_delete=True)
