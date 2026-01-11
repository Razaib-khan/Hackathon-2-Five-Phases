"""
Task Request/Response Schemas

Implements:
- TaskCreateRequest: Create task with title, optional description
- TaskUpdateRequest: Update title, description, completed status
- TaskResponse: Single task response
- TaskListResponse: Paginated task list
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TaskCreateRequest(BaseModel):
    """
    Task creation request schema.

    Validates:
    - title: Required, 1-200 characters
    - description: Optional, max 1000 characters
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


class TaskUpdateRequest(BaseModel):
    """
    Task update request schema.

    All fields optional - only provided fields are updated.
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


class TaskResponse(BaseModel):
    """Single task response schema."""

    id: UUID = Field(..., description="Task UUID")
    user_id: UUID = Field(..., description="Owner user UUID")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Completion status")
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
