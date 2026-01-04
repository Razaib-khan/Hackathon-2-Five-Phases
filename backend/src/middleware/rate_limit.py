"""
Rate Limiting Middleware

Applies rate limiting to API endpoints:
- Checks rate limit before processing request
- Returns HTTP 429 if limit exceeded
- Adds rate limit headers to response
- Per-user rate limiting based on JWT token

Headers added:
- X-RateLimit-Limit: Maximum requests allowed
- X-RateLimit-Remaining: Requests remaining in window
- X-RateLimit-Reset: Unix timestamp when limit resets
- Retry-After: Seconds until limit resets (only on 429)
"""

from typing import Callable, Optional
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import time

from ..services.rate_limiter import get_rate_limiter
from ..security.jwt import decode_access_token


class RateLimitMiddleware:
    """
    Middleware to apply rate limiting to requests.

    Usage:
        app.middleware("http")(RateLimitMiddleware(app))
    """

    def __init__(
        self,
        app,
        exclude_paths: Optional[list[str]] = None,
    ):
        """
        Initialize middleware.

        Args:
            app: FastAPI application instance
            exclude_paths: List of paths to exclude from rate limiting
        """
        self.app = app
        self.exclude_paths = exclude_paths or [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/health",
            "/metrics",
        ]
        self.rate_limiter = get_rate_limiter()

    async def __call__(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """
        Process request and apply rate limiting.

        Args:
            request: Incoming request
            call_next: Next middleware/handler in chain

        Returns:
            Response with rate limit headers
        """
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)

        # Extract user ID from JWT token
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
            try:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
            except Exception:
                # Invalid token, continue without user ID
                pass

        # Use IP address as fallback if no user ID
        if not user_id:
            # Get client IP (handle proxies)
            user_id = request.headers.get("X-Forwarded-For", request.client.host).split(",")[0].strip()

        # Check rate limit
        endpoint = request.url.path
        allowed, remaining, limit, reset_time = self.rate_limiter.check_rate_limit(
            user_id=user_id,
            endpoint=endpoint,
        )

        # If rate limit exceeded, return 429
        if not allowed:
            retry_after = max(0, reset_time - int(time.time()))

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please try again later.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                },
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                    "Retry-After": str(retry_after),
                },
            )

        # Process request
        response = await call_next(request)

        # Add rate limit headers to response
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)

        return response


# Dependency for manual rate limit checking
def check_rate_limit(request: Request) -> None:
    """
    Dependency to manually check rate limit.

    Usage:
        @router.get("/endpoint", dependencies=[Depends(check_rate_limit)])
        def endpoint(): ...

    Raises:
        HTTPException: If rate limit exceeded
    """
    rate_limiter = get_rate_limiter()

    # Extract user ID from request
    user_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
        except Exception:
            pass

    if not user_id:
        user_id = request.headers.get("X-Forwarded-For", request.client.host).split(",")[0].strip()

    endpoint = request.url.path
    allowed, remaining, limit, reset_time = rate_limiter.check_rate_limit(
        user_id=user_id,
        endpoint=endpoint,
    )

    if not allowed:
        retry_after = max(0, reset_time - int(time.time()))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
            headers={
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time),
                "Retry-After": str(retry_after),
            },
        )
