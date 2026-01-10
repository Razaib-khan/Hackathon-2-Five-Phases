from sqlmodel import create_engine, Session
from typing import Generator
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from ..config.settings import settings

# Load environment variables from .env file
load_dotenv()

# Use DATABASE_URL from environment if available, otherwise construct from individual settings
database_url = os.getenv("DATABASE_URL")

if not database_url:
    # URL encode the password to handle special characters
    encoded_password = quote_plus(settings.database_password) if settings.database_password else ""
    # Construct the database URL from individual settings
    database_url = f"postgresql://{settings.database_username}:{encoded_password}@{settings.database_host}:{settings.database_port}/{settings.database_name}"

# Create the engine with connection pooling settings
engine = create_engine(
    database_url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.database_echo
)

def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session