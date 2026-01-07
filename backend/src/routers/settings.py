"""
User Settings API Router

Implements user preferences endpoints:
- GET /user/settings: Get user settings (creates defaults if not exists)
- PATCH /user/settings: Update user preferences

All endpoints require authentication.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..security.jwt import get_current_user
from ..models.user import User
from ..schemas.user_settings import (
    UserSettingsResponse,
    UserSettingsUpdateRequest,
)
from ..services.settings_service import SettingsService

router = APIRouter(prefix="/user/settings", tags=["settings"])


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserSettingsResponse:
    """
    Get user settings.

    Creates default settings if they don't exist yet.

    **Implements**: FR-091 to FR-095

    **Default Values**:
    - theme: system
    - default_view: list
    - date_format: MMM dd, yyyy
    - week_start_day: 0 (Sunday)
    - animations_enabled: true
    - pomodoro_work_minutes: 25
    - pomodoro_break_minutes: 5
    """
    settings = SettingsService.get_settings(session, current_user.id)
    return UserSettingsResponse.model_validate(settings)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    data: UserSettingsUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserSettingsResponse:
    """
    Update user settings.

    All fields are optional. Only provided fields are updated.

    **Implements**: FR-006 to FR-010, FR-061, FR-090 to FR-095

    **Updatable Fields**:
    - theme: light/dark/system (FR-006)
    - default_view: list/kanban/calendar/matrix (FR-091)
    - date_format: Display format (FR-092)
    - week_start_day: 0-6 (0=Sunday) (FR-093)
    - animations_enabled: Boolean (FR-090)
    - pomodoro_work_minutes: 1-60 minutes (FR-061)
    - pomodoro_break_minutes: 1-30 minutes (FR-061)
    """
    settings = SettingsService.update_settings(session, current_user.id, data)
    return UserSettingsResponse.model_validate(settings)
