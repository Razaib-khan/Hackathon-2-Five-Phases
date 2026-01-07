"""
Task Request/Response Schemas

Implements:
- TaskCreateRequest: Create task with all fields including priority, tags, due date
- TaskUpdateRequest: Update any task field with optimistic locking
- TaskResponse: Single task response with nested tags and subtasks
- TaskListResponse: Paginated task list
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TaskCreateRequest(BaseModel):
    """
    Task creation request schema.

    Validates:
    - title: Required, 1-200 characters
    - description: Optional, max 1000 characters
    - priority: One of high/medium/low/none (FR-001)
    - due_date: Optional deadline (FR-011)
    - status: One of todo/in_progress/done (FR-026)
    - tag_ids: List of tag UUIDs to assign (max 10) (FR-017)
    - recurrence_pattern: Daily/Weekly/Monthly config (FR-072)
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title",
        examples=["Complete project documentation"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description",
        examples=["Write comprehensive docs for the API endpoints"],
    )
    priority: str = Field(
        default="none",
        pattern="^(high|medium|low|none)$",
        description="Task priority level",
        examples=["high"],
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional deadline",
        examples=["2026-01-15T23:59:59Z"],
    )
    status: str = Field(
        default="todo",
        pattern="^(todo|in_progress|done)$",
        description="Kanban status",
        examples=["todo"],
    )
    tag_ids: Optional[List[UUID]] = Field(
        default=None,
        max_length=10,
        description="List of tag UUIDs (max 10)",
        examples=[],
    )
    recurrence_pattern: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Recurrence configuration (daily/weekly/monthly)",
        examples=[{"enabled": True, "frequency": "daily", "interval": 1}],
    )


class TaskUpdateRequest(BaseModel):
    """
    Task update request schema with optimistic locking.

    All fields optional - only provided fields are updated.
    Includes version field for conflict detection (FR-103).
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Updated task description",
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Task completion status",
    )
    priority: Optional[str] = Field(
        default=None,
        pattern="^(high|medium|low|none)$",
        description="Task priority level",
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Task deadline",
    )
    status: Optional[str] = Field(
        default=None,
        pattern="^(todo|in_progress|done)$",
        description="Kanban status",
    )
    time_spent: Optional[int] = Field(
        default=None,
        ge=0,
        description="Accumulated minutes tracked",
    )
    custom_order: Optional[int] = Field(
        default=None,
        description="User-defined list position",
    )
    recurrence_pattern: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Recurrence configuration",
    )
    version: Optional[int] = Field(
        default=None,
        description="Optimistic locking version (required for conflict detection)",
    )


class TaskResponse(BaseModel):
    """Single task response schema with nested tags and subtasks."""

    id: UUID = Field(..., description="Task UUID")
    user_id: UUID = Field(..., description="Owner user UUID")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Completion status")

    # New fields from advanced features
    priority: str = Field(..., description="Priority level (high/medium/low/none)")
    due_date: Optional[datetime] = Field(None, description="Task deadline")
    status: str = Field(..., description="Kanban status (todo/in_progress/done)")
    time_spent: int = Field(..., description="Accumulated minutes tracked")
    custom_order: Optional[int] = Field(None, description="User-defined position")
    recurrence_pattern: Optional[Dict[str, Any]] = Field(None, description="Recurrence config")
    version: int = Field(..., description="Optimistic locking version")

    # Nested relationships (populated via joins or separate queries)
    tags: Optional[List[Dict[str, Any]]] = Field(default=[], description="Assigned tags")
    subtasks: Optional[List[Dict[str, Any]]] = Field(default=[], description="Task checklist")

    # Computed fields
    subtask_count: Optional[int] = Field(default=0, description="Total subtasks")
    completed_subtask_count: Optional[int] = Field(default=0, description="Completed subtasks")

    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """
    Paginated task list response.

    Includes:
    - tasks: List of task objects
    - total: Total number of tasks matching query
    - page: Current page number
    - page_size: Number of items per page
    """

    tasks: List[TaskResponse] = Field(
        ...,
        description="List of tasks",
    )
    total: int = Field(
        ...,
        description="Total number of tasks matching query",
    )
    page: int = Field(
        ...,
        description="Current page number (1-indexed)",
    )
    page_size: int = Field(
        ...,
        description="Number of items per page",
    )


# Bulk Operations Schemas (FR-104, FR-105)

class BulkTaskCreateRequest(BaseModel):
    """Bulk task creation request (max 50 tasks per request)."""

    tasks: List[TaskCreateRequest] = Field(
        ...,
        max_length=50,
        description="List of tasks to create (max 50)",
    )


class TaskUpdateData(BaseModel):
    """Single task update in bulk operation."""

    task_id: str = Field(..., description="Task UUID to update")
    updates: Dict[str, Any] = Field(..., description="Fields to update")


class BulkTaskUpdateRequest(BaseModel):
    """Bulk task update request (max 50 tasks per request)."""

    updates: List[TaskUpdateData] = Field(
        ...,
        max_length=50,
        description="List of task updates (max 50)",
    )


class BulkTaskDeleteRequest(BaseModel):
    """Bulk task deletion request (max 50 tasks per request)."""

    task_ids: List[str] = Field(
        ...,
        max_length=50,
        description="List of task UUIDs to delete (max 50)",
    )
