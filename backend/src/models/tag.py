"""
Tag SQLModel Entity

Represents a user-defined category label for task organization:
- id: UUID primary key
- user_id: Foreign key to users table
- name: Tag name (max 50 chars, unique per user)
- color: Hex color code (e.g., #FF5733)
- created_at: Timestamp

Relationships:
- user: Many-to-one relationship with User
- tasks: Many-to-many relationship with Task via TaskTag junction

Constraints:
- Unique (user_id, name): Prevent duplicate tag names per user
- Maximum 100 tags per user (enforced at application layer - FR-106)

Indexes:
- user_id: For filtering tags by user
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional, List
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

if TYPE_CHECKING:
    from .user import User
    from .task_tag import TaskTag


class Tag(SQLModel, table=True):
    """Tag entity for task categorization."""

    __tablename__ = "tags"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="tags_user_id_name_unique"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="#808080", max_length=7)  # Hex color code
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tags")
    task_tags: List["TaskTag"] = Relationship(back_populates="tag")
