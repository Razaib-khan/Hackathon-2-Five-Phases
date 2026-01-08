from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional, List
from datetime import datetime
from sqlalchemy import DateTime, func, Column
from uuid import UUID
from .base import Base

if TYPE_CHECKING:
    from .user import User
    from .permission import Permission


# Association table for many-to-many relationship between users and roles
class UserRoleLink(SQLModel, table=True):
    __tablename__ = "user_roles"
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id", primary_key=True)
    role_id: Optional[int] = Field(default=None, foreign_key="roles.id", primary_key=True)
    assigned_at: Optional[datetime] = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))


class Role(Base, table=True):
    """Role model representing a set of permissions that can be assigned to users."""
    __tablename__ = "roles"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False, max_length=50)
    description: Optional[str] = Field(default=None, max_length=200)
    is_active: bool = Field(default=True)

    # Relationships
    users: List["User"] = Relationship(back_populates="roles", link_model=UserRoleLink)
    permissions: List["Permission"] = Relationship(back_populates="roles")


# Pydantic models for API requests/responses
from pydantic import BaseModel
from typing import Optional


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True