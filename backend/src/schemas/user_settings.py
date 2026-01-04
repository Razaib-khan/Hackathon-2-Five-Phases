"""
UserSettings Request/Response Schemas

Implements:
- UserSettingsUpdateRequest: Update user preferences
- UserSettingsResponse: Complete settings response
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserSettingsUpdateRequest(BaseModel):
    """
    User settings update request schema.

    All fields optional - only provided fields are updated.

    Validates:
    - theme: One of light/dark/system (FR-006)
    - default_view: One of list/kanban/calendar/matrix (FR-091)
    - date_format: Display format string (FR-092)
    - week_start_day: 0=Sunday, 1=Monday (FR-093)
    - animations_enabled: Boolean toggle (FR-090)
    - pomodoro_work_minutes: Work session duration (FR-061)
    - pomodoro_break_minutes: Break session duration (FR-061)
    """

    theme: Optional[str] = Field(
        default=None,
        pattern="^(light|dark|system)$",
        description="Theme preference",
        examples=["dark"],
    )
    default_view: Optional[str] = Field(
        default=None,
        pattern="^(list|kanban|calendar|matrix)$",
        description="Default task view",
        examples=["kanban"],
    )
    date_format: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=20,
        description="Date display format",
        examples=["MMM dd, yyyy"],
    )
    week_start_day: Optional[int] = Field(
        default=None,
        ge=0,
        le=6,
        description="Week start day (0=Sunday, 6=Saturday)",
        examples=[1],
    )
    animations_enabled: Optional[bool] = Field(
        default=None,
        description="Enable UI animations",
        examples=[True],
    )
    pomodoro_work_minutes: Optional[int] = Field(
        default=None,
        ge=1,
        le=60,
        description="Pomodoro work session duration",
        examples=[25],
    )
    pomodoro_break_minutes: Optional[int] = Field(
        default=None,
        ge=1,
        le=30,
        description="Pomodoro break session duration",
        examples=[5],
    )


class UserSettingsResponse(BaseModel):
    """Complete user settings response schema."""

    id: UUID = Field(..., description="Settings UUID")
    user_id: UUID = Field(..., description="Owner user UUID")

    # Theme preferences
    theme: str = Field(..., description="Theme preference (light/dark/system)")
    default_view: str = Field(..., description="Default view (list/kanban/calendar/matrix)")

    # Display preferences
    date_format: str = Field(..., description="Date display format")
    week_start_day: int = Field(..., description="Week start day (0=Sunday)")
    animations_enabled: bool = Field(..., description="UI animations enabled")

    # Pomodoro timer preferences
    pomodoro_work_minutes: int = Field(..., description="Work session minutes")
    pomodoro_break_minutes: int = Field(..., description="Break session minutes")

    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True
