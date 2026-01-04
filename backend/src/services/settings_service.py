"""
User Settings Service Layer

Implements business logic for user preferences:
- get_settings: Retrieve user settings, create defaults if not exists
- update_settings: Update user preferences

Settings Fields (FR-091 to FR-095):
- theme: light/dark/system preference (FR-006)
- default_view: list/kanban/calendar/matrix (FR-091)
- date_format: Display format string (FR-092)
- week_start_day: 0=Sunday, 1=Monday (FR-093)
- animations_enabled: Boolean toggle (FR-090)
- pomodoro_work_minutes: Work session duration (FR-061)
- pomodoro_break_minutes: Break session duration (FR-061)
"""

from uuid import UUID

from sqlmodel import Session, select

from ..models.user_settings import UserSettings
from ..schemas.user_settings import UserSettingsUpdateRequest


class SettingsService:
    """Service for user settings operations."""

    @staticmethod
    def get_settings(session: Session, user_id: UUID) -> UserSettings:
        """
        Get user settings, creating defaults if not exists.

        Args:
            session: Database session
            user_id: Owner user UUID

        Returns:
            UserSettings instance (existing or newly created with defaults)
        """
        # Try to find existing settings
        statement = select(UserSettings).where(UserSettings.user_id == user_id)
        settings = session.exec(statement).first()

        if not settings:
            # Create default settings
            settings = UserSettings(
                user_id=user_id,
                theme="system",
                default_view="list",
                date_format="MMM dd, yyyy",
                week_start_day=0,
                animations_enabled=True,
                pomodoro_work_minutes=25,
                pomodoro_break_minutes=5,
            )
            session.add(settings)
            session.commit()
            session.refresh(settings)

        return settings

    @staticmethod
    def update_settings(
        session: Session,
        user_id: UUID,
        data: UserSettingsUpdateRequest,
    ) -> UserSettings:
        """
        Update user settings.

        Args:
            session: Database session
            user_id: Owner user UUID
            data: Update data (all fields optional)

        Returns:
            Updated UserSettings instance
        """
        # Get existing settings (creates defaults if not exists)
        settings = SettingsService.get_settings(session, user_id)

        # Update fields if provided
        if data.theme is not None:
            settings.theme = data.theme
        if data.default_view is not None:
            settings.default_view = data.default_view
        if data.date_format is not None:
            settings.date_format = data.date_format
        if data.week_start_day is not None:
            settings.week_start_day = data.week_start_day
        if data.animations_enabled is not None:
            settings.animations_enabled = data.animations_enabled
        if data.pomodoro_work_minutes is not None:
            settings.pomodoro_work_minutes = data.pomodoro_work_minutes
        if data.pomodoro_break_minutes is not None:
            settings.pomodoro_break_minutes = data.pomodoro_break_minutes

        session.add(settings)
        session.commit()
        session.refresh(settings)

        return settings
