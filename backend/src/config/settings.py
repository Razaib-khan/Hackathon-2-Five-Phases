from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database settings
    database_host: str = os.getenv("DATABASE_HOST", "localhost")
    database_port: int = int(os.getenv("DATABASE_PORT", "5432"))
    database_name: str = os.getenv("DATABASE_NAME", "aido_db")
    database_username: str = os.getenv("DATABASE_USERNAME", "postgres")
    database_password: str = os.getenv("DATABASE_PASSWORD", "")
    database_echo: bool = os.getenv("DATABASE_ECHO", "False").lower() == "true"

    # Auth settings
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Email settings
    smtp_server: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_username: str = os.getenv("SMTP_USERNAME", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    email_from: str = os.getenv("EMAIL_FROM", "noreply@aidoapp.com")

    # App settings
    app_name: str = os.getenv("APP_NAME", "AIDO Todo App")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"

    # CORS settings
    allowed_origins: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

    # Better Auth settings
    better_auth_secret: str = os.getenv("BETTER_AUTH_SECRET", "your-better-auth-secret")
    base_url: str = os.getenv("BASE_URL", "http://localhost:8000")


settings = Settings()