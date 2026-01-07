from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError
from typing import Union, Dict, Any
import logging
import traceback
from datetime import datetime
from ..models.response import ErrorResponse


logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware:
    """Middleware to handle various types of errors and exceptions."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        request = Request(scope)
        try:
            response = await self.app(scope, receive, send)
            return response
        except Exception as exc:
            return await self.handle_exception(request, exc)

    async def handle_exception(self, request: Request, exc: Exception) -> JSONResponse:
        """Handle different types of exceptions and return appropriate responses."""
        error_details = {
            "url": str(request.url),
            "method": request.method,
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": type(exc).__name__,
        }

        # Log the error with traceback
        logger.error(f"Error occurred: {str(exc)}", exc_info=True)

        # Handle different exception types
        if isinstance(exc, StarletteHTTPException):
            status_code = exc.status_code
            message = exc.detail
            error_code = getattr(exc, 'error_code', None)
        elif isinstance(exc, RequestValidationError):
            status_code = 422
            message = "Validation error"
            error_code = "VALIDATION_ERROR"
            error_details["validation_errors"] = [
                {
                    "loc": err["loc"],
                    "msg": err["msg"],
                    "type": err["type"]
                }
                for err in exc.errors()
            ]
        elif isinstance(exc, ValidationError):
            status_code = 422
            message = "Data validation error"
            error_code = "DATA_VALIDATION_ERROR"
        elif isinstance(exc, IntegrityError):
            status_code = 409
            message = "Data integrity error"
            error_code = "INTEGRITY_ERROR"
            # Extract more specific error information
            original_exception = exc.orig
            error_details["original_error"] = str(original_exception)
        elif isinstance(exc, HTTPException):
            status_code = exc.status_code
            message = exc.detail
            error_code = getattr(exc, 'error_code', None)
        else:
            # Unexpected error
            status_code = 500
            message = "Internal server error"
            error_code = "INTERNAL_ERROR"
            error_details["traceback"] = traceback.format_exc()

        # Create error response
        error_response = ErrorResponse(
            status="error",
            message=message,
            error_code=error_code,
            details=error_details
        )

        return JSONResponse(
            status_code=status_code,
            content=error_response.model_dump()
        )


def add_error_handlers(app):
    """Add error handlers to the FastAPI app."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
                "message": exc.detail,
                "error_code": getattr(exc, 'error_code', None),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Validation Exception: {exc}")
        return JSONResponse(
            status_code=422,
            content={
                "status": "error",
                "message": "Validation error",
                "error_code": "VALIDATION_ERROR",
                "details": {
                    "errors": [
                        {
                            "loc": err["loc"],
                            "msg": err["msg"],
                            "type": err["type"]
                        }
                        for err in exc.errors()
                    ]
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"General Exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Internal server error",
                "error_code": "INTERNAL_ERROR",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    return app