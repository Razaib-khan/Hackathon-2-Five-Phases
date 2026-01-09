from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    hackathon_id: UUID
    max_members: Optional[int] = 5


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_members: Optional[int] = None
    is_active: Optional[bool] = None


class TeamResponse(TeamBase):
    id: UUID
    created_by: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamMemberBase(BaseModel):
    team_id: UUID
    user_id: UUID
    role: str = "member"


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    role: Optional[str] = None
    is_confirmed: Optional[bool] = None
    is_active: Optional[bool] = None


class TeamMemberResponse(TeamMemberBase):
    id: UUID
    joined_at: datetime
    is_confirmed: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamInvitationBase(BaseModel):
    team_id: UUID
    invitee_email: str


class TeamInvitationCreate(TeamInvitationBase):
    pass


class TeamInvitationUpdate(BaseModel):
    status: Optional[str] = None


class TeamInvitationResponse(TeamInvitationBase):
    id: UUID
    invited_by: UUID
    status: str
    expires_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamWithMembersResponse(TeamResponse):
    members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True