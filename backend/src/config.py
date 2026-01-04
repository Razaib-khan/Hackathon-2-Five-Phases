"""
Application Configuration

Centralizes all configuration from environment variables with defaults.
Uses pydantic-settings pattern for validation.

Environment variables:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Secret key for JWT signing (MUST change in production)
- JWT_ALGORITHM: JWT signing algorithm (default: HS256)
- JWT_EXPIRATION_HOURS: Token expiration time (default: 1 hour)
- CORS_ORIGINS: Comma-separated list of allowed origins
- DEBUG: Enable debug mode (default: False)
- REDIS_URL: Redis connection string for rate limiting (optional)
- RATE_LIMIT_REQUESTS: Maximum requests per window (default: 100)
- RATE_LIMIT_WINDOW: Rate limit window in seconds (default: 60)
"""

import os
from typing import List


class Settings:
    """Application settings loaded from environment."""

    def __init__(self):
        # Database - REQUIRED (no default; must be set in environment)
        self.database_url: str = os.getenv("DATABASE_URL")
        if not self.database_url:
            raise ValueError(
                "DATABASE_URL environment variable is required. "
                "Please create backend/.env from backend/.env.example and set DATABASE_URL."
            )

        # JWT Configuration
        self.jwt_secret: str = os.getenv(
            "JWT_SECRET",
            "development-secret-change-in-production"
        )
        self.jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_expiration_hours: int = int(
            os.getenv("JWT_EXPIRATION_HOURS", "1")
        )

        # CORS
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        self.cors_origins: List[str] = [
            origin.strip() for origin in cors_origins.split(",")
        ]

        # Debug mode
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"

        # Redis Configuration (optional, for rate limiting)
        self.REDIS_URL: str = os.getenv("REDIS_URL", "")

        # Rate Limiting Configuration
        self.RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
        self.RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

        # API Settings
        self.api_title: str = "AIDO Todo API"
        self.api_version: str = "2.0.0"


# Singleton settings instance
settings = Settings()
