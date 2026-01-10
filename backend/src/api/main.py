from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ..config.settings import settings
from .auth_router import auth_router
from .task_router import task_router
from .security import add_security_middleware
from ..utils.errors import AidoException
import os
import traceback
from ..utils.logging import app_logger


def create_app() -> FastAPI:
    app = FastAPI(
        title="AIDO Todo API",
        description="API for the AIDO Todo Application",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Add security middleware first
    add_security_middleware(app)

    # CORS middleware
    origins = [origin.strip() for origin in settings.allowed_origins.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handlers
    @app.exception_handler(AidoException)
    async def aido_exception_handler(request: Request, exc: AidoException):
        app_logger.error(f"AIDO Exception: {exc.detail} at {request.url}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        app_logger.error(f"Unexpected error: {str(exc)} at {request.url}\nTraceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

    # Include routers
    app.include_router(auth_router, prefix="/api", tags=["authentication"])
    app.include_router(task_router, prefix="/tasks", tags=["tasks"])

    @app.get("/")
    def read_root():
        return {"message": "Welcome to AIDO Todo API"}

    return app