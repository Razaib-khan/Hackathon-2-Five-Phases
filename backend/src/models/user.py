"""
User SQLModel Entity

Represents an authenticated application user with:
- id: UUID primary key
- email: unique, indexed
- password_hash: bcrypt hashed password (never store plaintext)
- created_at, updated_at: timestamps

Relationships:
- tasks: One-to-many relationship with Task (cascade delete)
"""

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .task import Task


class User(SQLModel, table=True):
    """User entity for authentication and task ownership."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # One-to-many relationship: User has many Tasks
    # cascade delete handled via foreign key in Task model
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class UserPublic(SQLModel):
    """Public user data (no password_hash) for API responses."""

    id: UUID
    email: str
