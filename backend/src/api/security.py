from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from ..utils.logging import app_logger
import time
import secrets
import hashlib
from typing import Set


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Add security headers
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        # Prevent caching of sensitive data
        if request.url.path.startswith('/auth') or request.url.path.startswith('/tasks'):
            response.headers["Cache-Control"] = "no-store"
            response.headers["Pragma"] = "no-cache"

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Enhanced rate limiting middleware with more sophisticated limits
    """
    def __init__(self, app: FastAPI,
                 general_limit: int = 100, general_window: int = 3600,
                 auth_limit: int = 10, auth_window: int = 60,
                 task_limit: int = 50, task_window: int = 3600):
        super().__init__(app)
        self.general_limit = general_limit
        self.general_window = general_window
        self.auth_limit = auth_limit
        self.auth_window = auth_window
        self.task_limit = task_limit
        self.task_window = task_window
        self.requests = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        endpoint = request.url.path

        # Determine rate limit based on endpoint
        if endpoint.startswith('/auth'):
            max_requests = self.auth_limit
            window_seconds = self.auth_window
        elif endpoint.startswith('/tasks'):
            max_requests = self.task_limit
            window_seconds = self.task_window
        else:
            max_requests = self.general_limit
            window_seconds = self.general_window

        # Create a key that includes IP and endpoint for more granular control
        key = f"{client_ip}:{endpoint}"

        # Simple in-memory rate limiting (not suitable for production)
        current_time = time.time()

        if key not in self.requests:
            self.requests[key] = []

        # Clean old requests
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < window_seconds
        ]

        # Check if limit exceeded
        if len(self.requests[key]) >= max_requests:
            app_logger.warning(f"Rate limit exceeded for IP: {client_ip}, endpoint: {endpoint}")
            return Response(
                status_code=429,
                content="Rate limit exceeded"
            )

        # Add current request
        self.requests[key].append(current_time)

        response = await call_next(request)
        return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate input data and prevent common attacks
    """
    def __init__(self, app: FastAPI):
        super().__init__(app)
        self.blocked_patterns: Set[str] = {
            '<script', 'javascript:', 'vbscript:', 'onerror', 'onload',
            'document.cookie', 'alert(', 'eval(', 'expression(',
            'DROP TABLE', 'UNION SELECT', 'INSERT INTO', 'DELETE FROM',
            '../', '..\\', '<iframe', 'onclick', 'onmouseover'
        }

    async def dispatch(self, request: Request, call_next):
        # For POST/PUT requests, check the body for malicious content
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                body_bytes = await request.body()
                body_str = body_bytes.decode('utf-8').lower()

                for pattern in self.blocked_patterns:
                    if pattern.lower() in body_str:
                        app_logger.warning(f"Blocked malicious input from IP: {request.client.host}, pattern: {pattern}")
                        return Response(
                            status_code=400,
                            content="Malicious input detected"
                        )
            except Exception:
                # If we can't read the body, continue normally
                pass

        response = await call_next(request)
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Enhanced middleware to log all requests with security focus
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log the request
        app_logger.info(
            f"REQUEST - {request.method} {request.url.path} "
            f"FROM {request.client.host} "
            f"USER_AGENT: {request.headers.get('user-agent', 'Unknown')} "
            f"CONTENT_TYPE: {request.headers.get('content-type', 'Unknown')}"
        )

        response = await call_next(request)

        process_time = time.time() - start_time
        formatted_process_time = f"{process_time:.4f}"

        app_logger.info(
            f"RESPONSE - {request.method} {request.url.path} "
            f"STATUS: {response.status_code} "
            f"TIME: {formatted_process_time}s "
            f"FROM: {request.client.host}"
        )

        return response


def add_security_middleware(app: FastAPI):
    """
    Add all security middleware to the application in the correct order
    """
    # Add input validation first to catch malicious requests early
    app.add_middleware(InputValidationMiddleware)

    # Add security headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Add logging middleware
    app.add_middleware(LoggingMiddleware)

    # Add rate limiting (after logging to ensure all requests are logged)
    app.add_middleware(
        RateLimitMiddleware,
        general_limit=100, general_window=3600,
        auth_limit=10, auth_window=60,
        task_limit=50, task_window=3600
    )

    # Add trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0", "*.ngrok.io", "aido-app.com", "127.0.0.1:3000", "localhost:3000"]
    )