"""
Database Module for AIDO Backend

Exports:
- engine: SQLAlchemy engine for database operations
- get_session: FastAPI dependency for database sessions
"""

from .session import engine, get_session

__all__ = ["engine", "get_session"]
