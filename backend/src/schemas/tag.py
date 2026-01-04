"""
Tag Request/Response Schemas

Implements:
- TagCreateRequest: Create tag with name and color
- TagResponse: Single tag response
- TagListResponse: List of all user tags
"""

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class TagCreateRequest(BaseModel):
    """
    Tag creation request schema.

    Validates:
    - name: Required, 1-50 characters, unique per user (FR-016)
    - color: Optional hex color code (defaults to #808080)

    Limits:
    - Maximum 100 tags per user (enforced at API layer - FR-106)
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Tag name (unique per user)",
        examples=["Work"],
    )
    color: str = Field(
        default="#808080",
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Hex color code",
        examples=["#FF5733"],
    )


class TagUpdateRequest(BaseModel):
    """
    Tag update request schema.

    All fields optional - only provided fields are updated (FR-020).
    """

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Updated tag name",
    )
    color: Optional[str] = Field(
        default=None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="Updated hex color code",
    )


class TagResponse(BaseModel):
    """Single tag response schema."""

    id: UUID = Field(..., description="Tag UUID")
    user_id: UUID = Field(..., description="Owner user UUID")
    name: str = Field(..., description="Tag name")
    color: str = Field(..., description="Hex color code")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """List of all user tags."""

    tags: List[TagResponse] = Field(
        ...,
        description="List of user tags",
    )
    total: int = Field(
        ...,
        description="Total number of tags",
    )
