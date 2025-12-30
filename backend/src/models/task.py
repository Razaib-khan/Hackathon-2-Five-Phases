"""
Task SQLModel Entity

Represents a todo item belonging to a user with:
- id: UUID primary key
- user_id: Foreign key to users table
- title: Required, max 200 chars
- description: Optional, max 1000 chars
- completed: Boolean, defaults to false
- created_at, updated_at: timestamps

Relationships:
- user: Many-to-one relationship with User

Indexes:
- user_id: For filtering tasks by user
- (user_id, created_at): For efficient task list queries with ordering
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel, Index

if TYPE_CHECKING:
    from .user import User


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
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Many-to-one relationship: Task belongs to User
    user: Optional["User"] = Relationship(back_populates="tasks")
