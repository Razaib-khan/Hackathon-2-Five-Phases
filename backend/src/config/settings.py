from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Project
    project_name: str = "AIDO API"
    version: str = "1.0.0"
    description: str = "AIDO API - Complete Web API layer for task management"

    # Environment
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # API Configuration
    api_v1_str: str = "/v1"
    port: int = 8000
    host: str = "0.0.0.0"

    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./aido.db")
    db_echo: bool = False  # Set to True for SQL query logging

    # JWT Configuration
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key-here-replace-with-secure-random-value")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",  # Frontend dev server
        "http://localhost:8000",  # Backend dev server
        "http://localhost:3001",  # Alternative frontend port
        "https://aido-frontend.example.com",  # Production frontend
    ]

    # Security
    max_login_attempts: int = 5
    login_attempt_window: int = 900  # 15 minutes in seconds
    password_reset_token_expire_hours: int = 24

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hour in seconds

    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100

    # Email
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from: Optional[str] = None

    # MCP Server Integration
    hf_api_key: Optional[str] = None
    neon_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()