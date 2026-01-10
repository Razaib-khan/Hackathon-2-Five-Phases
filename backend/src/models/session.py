from sqlmodel import SQLModel, Field
import uuid
from datetime import datetime


class SessionBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    session_token: str = Field(unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)


class Session(SessionBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    last_accessed: datetime = Field(default_factory=datetime.utcnow)