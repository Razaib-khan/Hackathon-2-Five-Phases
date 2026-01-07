"""
TaskTag Junction Table Entity

Represents many-to-many relationship between tasks and tags:
- task_id: Foreign key to tasks table
- tag_id: Foreign key to tags table
- assigned_at: Timestamp when tag was assigned

Constraints:
- Composite primary key (task_id, tag_id)
- CASCADE DELETE: Assignment deleted when task or tag deleted
- Maximum 10 tags per task (enforced at application layer - FR-017)

Indexes:
- task_id: For retrieving tags by task
- tag_id: For retrieving tasks by tag
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .tag import Tag
    from .task import Task


class TaskTag(SQLModel, table=True):
    """Junction table for task-tag many-to-many relationship."""

    __tablename__ = "task_tags"

    task_id: UUID = Field(foreign_key="tasks.id", primary_key=True, index=True)
    tag_id: UUID = Field(foreign_key="tags.id", primary_key=True, index=True)
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships (optional - for ORM navigation)
    task: Optional["Task"] = Relationship(back_populates="task_tags")
    tag: Optional["Tag"] = Relationship(back_populates="task_tags")
