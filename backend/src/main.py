"""
AIDO Backend - FastAPI Application Entry Point

Phase 2: Web API with JWT Authentication
- FastAPI 0.104+ with stateless JWT verification
- SQLModel ORM for User/Task persistence
- Neon PostgreSQL database
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from .db.session import engine

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - creates database tables on startup."""
    # Create database tables
    SQLModel.metadata.create_all(engine)
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
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "https://razaib-khan.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.

    Verifies:
    - Application is running
    - Database connection is active

    Returns:
        dict: Health status with database connectivity confirmation
    """
    from sqlalchemy import text

    try:
        # Test database connectivity with simple query
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "version": "2.0.0",
        }
    except Exception as e:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=503, detail=f"Database unavailable: {str(e)}"
        )


# Import and include routers
from .api.auth import router as auth_router
from .api.tasks import router as tasks_router

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks_router, prefix="/api", tags=["Tasks"])


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
