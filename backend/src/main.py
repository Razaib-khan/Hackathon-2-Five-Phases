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

from .config.database import engine
from .config.settings import settings

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
        SQLModel.metadata.create_all(bind=engine)
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
    title=settings.project_name,
    description="AIDO API - Complete Web API layer for task management",
    version=settings.version,
    lifespan=lifespan,
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
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
from .api.auth import router as auth_router_legacy
from .api.auth_router import router as auth_router
from .api.user_router import router as user_router
from .api.project_router import router as project_router
from .api.task_router import router as task_router
from .api.dashboard_router import router as dashboard_router

# Include API routes with version prefix (for formal API access)
app.include_router(auth_router_legacy, prefix=settings.api_v1_str, tags=["Authentication (Legacy)"])
app.include_router(auth_router, prefix=settings.api_v1_str, tags=["Authentication"])
app.include_router(user_router, prefix=settings.api_v1_str, tags=["Users"])
app.include_router(project_router, prefix=settings.api_v1_str, tags=["Projects"])
app.include_router(task_router, prefix=settings.api_v1_str, tags=["Tasks"])
app.include_router(dashboard_router, prefix=settings.api_v1_str, tags=["Dashboard"])

# Include API routes without version prefix (for Hugging Face Space direct access)
app.include_router(auth_router_legacy, tags=["Authentication (Legacy Direct)"])
app.include_router(auth_router, tags=["Authentication (Direct)"])
app.include_router(user_router, tags=["Users (Direct)"])
app.include_router(project_router, tags=["Projects (Direct)"])
app.include_router(task_router, tags=["Tasks (Direct)"])
app.include_router(dashboard_router, tags=["Dashboard (Direct)"])


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
