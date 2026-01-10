from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "aido_db"
    database_username: str = "postgres"
    database_password: str = ""
    database_echo: bool = False
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


settings = Settings()