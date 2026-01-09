from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "postgresql://localhost/aido_todo"
    TEST_DATABASE_URL: str = "postgresql://localhost/aido_todo_test"

    # JWT settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Better Auth settings (removed OAuth)
    VERIFICATION_CODE_LENGTH: int = 6
    VERIFICATION_CODE_EXPIRY_MINUTES: int = 10

    # Email settings
    EMAIL_HOST: Optional[str] = None
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@aido-todo.com"

    # Cloud storage settings
    CLOUD_STORAGE_BUCKET: Optional[str] = None
    CLOUD_STORAGE_REGION: Optional[str] = None

    # Security settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]

    # Application settings
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()