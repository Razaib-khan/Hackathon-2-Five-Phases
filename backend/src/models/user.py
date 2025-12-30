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
<<<<<<< HEAD
    from .tag import Tag
    from .user_settings import UserSettings
=======
>>>>>>> 7375bb7 (feat(phase-2): implement Neon database configuration and backend/frontend scaffolding)


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

<<<<<<< HEAD
    # Relationships
=======
    # One-to-many relationship: User has many Tasks
    # cascade delete handled via foreign key in Task model
>>>>>>> 7375bb7 (feat(phase-2): implement Neon database configuration and backend/frontend scaffolding)
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
<<<<<<< HEAD
    tags: List["Tag"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    settings: Optional["UserSettings"] = Relationship(back_populates="user")
=======
>>>>>>> 7375bb7 (feat(phase-2): implement Neon database configuration and backend/frontend scaffolding)


class UserPublic(SQLModel):
    """Public user data (no password_hash) for API responses."""

    id: UUID
    email: str
