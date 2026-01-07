"""
Subtask Request/Response Schemas

Implements:
- SubtaskCreateRequest: Create subtask with title and order
- SubtaskUpdateRequest: Update subtask fields (all optional)
- SubtaskResponse: Single subtask response
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SubtaskCreateRequest(BaseModel):
    """
    Subtask creation request schema.

    Validates:
    - title: Required, 1-200 characters
    - order_index: Optional display position (default 0)

    Limits:
    - Maximum 50 subtasks per task (enforced at API layer - FR-106)
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Subtask title",
        examples=["Review documentation"],
    )
    order_index: int = Field(
        default=0,
        ge=0,
        description="Display position in checklist",
        examples=[0],
    )


class SubtaskUpdateRequest(BaseModel):
    """
    Subtask update request schema.

    All fields optional - only provided fields are updated.
    """

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated subtask title",
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Completion status",
    )
    order_index: Optional[int] = Field(
        default=None,
        ge=0,
        description="Updated display position",
    )


class SubtaskResponse(BaseModel):
    """Single subtask response schema."""

    id: UUID = Field(..., description="Subtask UUID")
    task_id: UUID = Field(..., description="Parent task UUID")
    title: str = Field(..., description="Subtask title")
    completed: bool = Field(..., description="Completion status")
    order_index: int = Field(..., description="Display position")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
