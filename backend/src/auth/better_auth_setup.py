from better_auth import auth, sqlstate
from better_auth.types import User
from fastapi import FastAPI
from ..config.settings import settings
from ..database.database import engine


def setup_better_auth(app: FastAPI):
    """
    Setup Better Auth for the application
    """
    # Initialize Better Auth with database configuration
    auth_client = auth.AuthClient(
        secret=settings.better_auth_secret,
        database_url=f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_host}:{settings.database_port}/{settings.database_name}",
        # Configure auth options
        email_password_enabled=True,
        rate_limit_enabled=False,
    )

    # Mount the auth routes
    app.include_router(auth_client.router, prefix="/api/auth")

    return auth_client