"""
Database Session Management

Implements:
- SQLAlchemy engine with psycopg3 driver
- Connection pooling with auto-recovery
- Session dependency for FastAPI routes

Usage:
    from backend.src.db.session import engine, get_session

    @app.get("/items")
    def list_items(session: Session = Depends(get_session)):
        return session.exec(select(Item)).all()
"""

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Load DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable not set. "
        "Please create backend/.env from backend/.env.example and set DATABASE_URL."
    )

# Create SQLAlchemy engine with psycopg3
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging (debugging)
    pool_pre_ping=True,  # Verify connection health before using
    pool_size=5,  # Number of persistent connections
    max_overflow=10,  # Additional connections when pool exhausted
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "timeout": 10,  # Connection timeout in seconds
        "application_name": "aido-todo",  # Identify app in Neon logs
    },
)


def get_session() -> Generator[Session, None, None]:
    """
    Provides a database session to FastAPI route handlers.

    The session is automatically committed on success and rolled back on error.
    It is also automatically closed after the request completes.

    Usage:
        @app.get("/items")
        def list_items(session: Session = Depends(get_session)):
            return session.exec(select(Item)).all()

    Yields:
        Session: Active database session
    """
    with Session(engine) as session:
        yield session
