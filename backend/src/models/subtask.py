"""
Subtask SQLModel Entity

Represents a checklist item within a parent task:
- id: UUID primary key
- task_id: Foreign key to tasks table
- title: Subtask description (max 200 chars)
- completed: Boolean completion status
- order_index: Display order within parent task
- created_at, updated_at: Timestamps

Relationships:
- task: Many-to-one relationship with Task

Constraints:
- Maximum 50 subtasks per task (enforced at application layer - FR-106)
- CASCADE DELETE: Subtasks deleted when parent task deleted

Indexes:
- task_id: For filtering subtasks by parent task
- (task_id, order_index): For efficient ordering within parent

Special Behavior (Clarification Q1):
- When parent task.completed = TRUE, all subtasks auto-complete (FR-040a)
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .task import Task


class Subtask(SQLModel, table=True):
    """Subtask entity for task checklists."""

    __tablename__ = "subtasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(foreign_key="tasks.id", index=True)
    title: str = Field(max_length=200)
    completed: bool = Field(default=False)
    order_index: int = Field(default=0)  # Position in checklist
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Relationships
    task: Optional["Task"] = Relationship(back_populates="subtasks")
