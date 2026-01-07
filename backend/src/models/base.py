from sqlmodel import SQLModel
from typing import Any, Dict, Optional
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, func
from sqlalchemy.types import TypeDecorator


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses CHAR(32), storing as stringified hex values.
    """
    impl = "CHAR"
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor("UUID")
        else:
            return dialect.type_descriptor("CHAR(32)")

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value).int
            else:
                return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value


class TimestampModel(SQLModel):
    """Base model with timestamp fields."""
    created_at: Optional[datetime] = Column(DateTime(timezone=True), default=func.now())
    updated_at: Optional[datetime] = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class Base(TimestampModel, SQLModel):
    """Base model for all database models."""
    __abstract__ = True