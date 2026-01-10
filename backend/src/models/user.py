from sqlmodel import SQLModel, Field
from typing import Optional
import uuid
from datetime import datetime


class UserBase(SQLModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: str = Field(unique=True, nullable=False, max_length=100)
    password_hash: str = Field(nullable=False)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    email_verified: bool = Field(default=False)
    last_login: Optional[datetime] = Field(default=None)