"""
AIDO Backend - FastAPI Application Entry Point

Phase 2: Web API with JWT Authentication
- FastAPI 0.104+ with stateless JWT verification
- SQLModel ORM for User/Task persistence
- Neon PostgreSQL database
"""

import os
import re
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from .db.session import engine

# Load environment variables
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")

# Log startup configuration (safely)
try:
    print("🚀 AIDO Backend Starting...")
    db_url = os.getenv('DATABASE_URL', 'NOT SET')
    if db_url and db_url != 'NOT SET':
        print(f"  DATABASE_URL: {db_url[:50]}...")
    else:
        print(f"  DATABASE_URL: NOT SET")
    print(f"  JWT_SECRET: {'SET' if os.getenv('JWT_SECRET') else 'NOT SET'}")
    print(f"  FRONTEND_URL: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")
except Exception as e:
    print(f"Warning: Error logging configuration: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - creates database tables on startup."""
    try:
        # Create database tables
        SQLModel.metadata.create_all(engine)
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {str(e)}")
        print(f"Database URL: {os.getenv('DATABASE_URL', 'NOT SET')[:50]}...")
        # Don't crash - let the app start so we can debug
        print("⚠️  Continuing startup anyway (database may be unavailable)")
    yield
    # Cleanup (if needed)


# Initialize FastAPI application
app = FastAPI(
    title="AIDO Todo API",
    description="Phase 2: Web API with JWT Authentication for todo task management",
    version="2.0.0",
    lifespan=lifespan,
)

# Configure CORS for frontend access
# IMPORTANT: CORS origins are domain-based, NOT including path components
# Path routing happens client-side in browsers
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [
    frontend_url,
    "http://localhost:3000",
    "http://localhost:8000",
    "https://razaib-khan.github.io",  # GitHub Pages (domain only, no path)
    "https://razaib123-aido-todo-api.hf.space",  # HF Spaces backend (for testing)
]

# Allow all origins from HF Spaces domain pattern
allow_origins_regex = r"https://razaib123-aido-todo-api\.hf\.space.*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origins_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware (if Redis is configured)
try:
    from .middleware.rate_limit import RateLimitMiddleware

    app.middleware("http")(RateLimitMiddleware(app))
    print("✓ Rate limiting middleware enabled")
except Exception as e:
    print(f"Warning: Rate limiting disabled: {e}")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.

    Verifies:
    - Application is running
    - Database connection (if available)

    Returns:
        dict: Health status
    """
    from sqlalchemy import text

    db_status = "unknown"
    try:
        # Test database connectivity with simple query
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"

    return {
        "status": "healthy",
        "database": db_status,
        "version": "2.0.0",
    }


# Import and include routers
from .api.auth import router as auth_router
from .api.tasks import router as tasks_router
from .routers.tags import router as tags_router
from .routers.subtasks import router as subtasks_router
from .routers.settings import router as settings_router
from .routers.analytics import router as analytics_router
from .routers.export import router as export_router
from .routers.search import router as search_router

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks_router, prefix="/api", tags=["Tasks"])
app.include_router(tags_router, prefix="/api")
app.include_router(subtasks_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(search_router, prefix="/api")


# Development entry point
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(
        "backend.src.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=port,
        reload=True,
    )
