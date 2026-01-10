from sqlmodel import SQLModel, Field
import uuid
from datetime import datetime


class PasswordResetTokenBase(SQLModel):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    token: str = Field(unique=True, nullable=False)
    expires_at: datetime = Field(nullable=False)
    used: bool = Field(default=False)


class PasswordResetToken(PasswordResetTokenBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)