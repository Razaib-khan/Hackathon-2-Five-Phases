"""
UserSettings SQLModel Entity

Represents user preferences and configuration:
- id: UUID primary key
- user_id: Foreign key to users table (UNIQUE - one settings per user)
- theme: Light/Dark/System preference (FR-006)
- default_view: List/Kanban/Calendar/Matrix (FR-091)
- date_format: Display format string (FR-092)
- week_start_day: 0=Sunday, 1=Monday (FR-093)
- animations_enabled: Boolean toggle (FR-090)
- pomodoro_work_minutes: Work session duration (FR-061)
- pomodoro_break_minutes: Break session duration (FR-061)
- created_at, updated_at: Timestamps

Relationships:
- user: One-to-one relationship with User

Defaults:
- theme: 'system' (auto-detect OS preference)
- default_view: 'list'
- date_format: 'MMM dd, yyyy'
- week_start_day: 0 (Sunday)
- animations_enabled: True
- pomodoro_work_minutes: 25
- pomodoro_break_minutes: 5
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class UserSettings(SQLModel, table=True):
    """UserSettings entity for user preferences."""

    __tablename__ = "user_settings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", unique=True, index=True)

    # Theme preferences
    theme: str = Field(default="system", max_length=10)  # light/dark/system
    default_view: str = Field(default="list", max_length=10)  # list/kanban/calendar/matrix

    # Display preferences
    date_format: str = Field(default="MMM dd, yyyy", max_length=20)
    week_start_day: int = Field(default=0)  # 0=Sunday, 1=Monday
    animations_enabled: bool = Field(default=True)

    # Pomodoro timer preferences
    pomodoro_work_minutes: int = Field(default=25)
    pomodoro_break_minutes: int = Field(default=5)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="settings")
