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
    from .tag import Tag
    from .user_settings import UserSettings
    from .role import Role, UserRoleLink
    from .project import Project


# Import after TYPE_CHECKING to avoid circular import during definition
from .role import UserRoleLink  # noqa: E402


class User(SQLModel, table=True):
    """User entity for authentication and task ownership."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(index=True, unique=True, max_length=255)
    email: str = Field(index=True, unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    tags: List["Tag"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    roles: List["Role"] = Relationship(back_populates="users", link_model=UserRoleLink)
    settings: Optional["UserSettings"] = Relationship(back_populates="user")
    owned_projects: List["Project"] = Relationship(back_populates="owner", sa_relationship_kwargs={"foreign_keys": "[Project.owner_id]"})



class UserPublic(SQLModel):
    """Public user data (no password_hash) for API responses."""

    id: UUID
    email: str
