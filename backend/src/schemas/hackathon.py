from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class HackathonStatus(str, Enum):
    DRAFT = "draft"
    REGISTRATION_OPEN = "registration_open"
    REGISTRATION_CLOSED = "registration_closed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PhaseType(str, Enum):
    REGISTRATION = "registration"
    IDEATION = "ideation"
    DEVELOPMENT = "development"
    SUBMISSION = "submission"
    PRESENTATION = "presentation"
    JUDGING = "judging"
    RESULTS = "results"


class HackathonBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    max_participants: Optional[int] = None


class HackathonCreate(HackathonBase):
    pass


class HackathonUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_participants: Optional[int] = None
    status: Optional[HackathonStatus] = None


class HackathonResponse(HackathonBase):
    id: UUID
    created_by: UUID
    status: HackathonStatus
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class PhaseBase(BaseModel):
    hackathon_id: UUID
    name: str
    description: Optional[str] = None
    phase_type: PhaseType
    start_date: datetime
    end_date: datetime


class PhaseCreate(PhaseBase):
    pass


class PhaseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    phase_type: Optional[PhaseType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class PhaseResponse(PhaseBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HackathonParticipantBase(BaseModel):
    hackathon_id: UUID
    user_id: UUID
    role: str = "participant"


class HackathonParticipantCreate(HackathonParticipantBase):
    pass


class HackathonParticipantResponse(HackathonParticipantBase):
    id: UUID
    joined_at: datetime
    is_confirmed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True