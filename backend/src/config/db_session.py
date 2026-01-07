from sqlmodel import Session, create_engine
from contextlib import contextmanager
from typing import Generator
from ..config.settings import settings


# Create the database engine
engine = create_engine(
    settings.database_url,
    echo=settings.db_echo,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=20,
    max_overflow=30
)


def get_db_session() -> Generator[Session, None, None]:
    """Get a database session using a context manager."""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()


@contextmanager
def get_session_context() -> Generator[Session, None, None]:
    """Context manager for database sessions."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Session:
    """Get a database session directly (for use in dependency injection)."""
    with Session(engine) as session:
        yield session