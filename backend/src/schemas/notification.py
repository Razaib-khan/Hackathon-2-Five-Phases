from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class NotificationType(str, Enum):
    PHASE_CHANGE = "phase_change"
    HACKATHON_UPDATE = "hackathon_update"
    DEADLINE_REMINDER = "deadline_reminder"
    ANNOUNCEMENT = "announcement"
    TEAM_INVITATION = "team_invitation"
    SUBMISSION_STATUS = "submission_status"


class NotificationStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class NotificationBase(BaseModel):
    user_id: UUID
    title: str
    message: str
    notification_type: NotificationType
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    status: Optional[NotificationStatus] = None
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: UUID
    status: NotificationStatus
    is_read: bool
    sent_at: datetime
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserNotificationPreferencesBase(BaseModel):
    email_notifications: Optional[bool] = True
    push_notifications: Optional[bool] = True
    phase_change_notifications: Optional[bool] = True
    deadline_reminders: Optional[bool] = True
    announcements: Optional[bool] = True


class UserNotificationPreferencesCreate(UserNotificationPreferencesBase):
    user_id: UUID


class UserNotificationPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    phase_change_notifications: Optional[bool] = None
    deadline_reminders: Optional[bool] = None
    announcements: Optional[bool] = None


class UserNotificationPreferencesResponse(UserNotificationPreferencesBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True