from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Optional
import time
import hashlib
import asyncio
from collections import defaultdict, deque
from datetime import datetime, timedelta


class RateLimiter:
    def __init__(self, max_requests: int = 100, window_seconds: int = 3600):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = defaultdict(lambda: deque())

    def is_allowed(self, identifier: str) -> bool:
        now = time.time()
        # Remove old requests outside the window
        while (self.requests[identifier] and
               now - self.requests[identifier][0] > self.window_seconds):
            self.requests[identifier].popleft()

        if len(self.requests[identifier]) >= self.max_requests:
            return False

        self.requests[identifier].append(now)
        return True


class SecurityMiddleware:
    def __init__(self):
        # Rate limiting: 100 requests per hour per IP
        self.rate_limiter = RateLimiter(max_requests=100, window_seconds=3600)

        # Rate limiting for auth endpoints: 5 requests per 15 minutes per IP
        self.auth_rate_limiter = RateLimiter(max_requests=5, window_seconds=900)

        # Track failed login attempts
        self.failed_login_attempts: Dict[str, deque] = defaultdict(lambda: deque())
        self.max_failed_attempts = 5
        self.lockout_duration = 900  # 15 minutes

    def get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        return request.client.host

    def is_login_endpoint(self, request: Request) -> bool:
        """Check if request is for a login endpoint"""
        return "/auth/login" in request.url.path or "/auth/register" in request.url.path

    def check_rate_limit(self, request: Request) -> bool:
        """Check if request is within rate limits"""
        client_ip = self.get_client_ip(request)

        if self.is_login_endpoint(request):
            return self.auth_rate_limiter.is_allowed(client_ip)
        else:
            return self.rate_limiter.is_allowed(client_ip)

    def record_failed_login(self, ip_address: str):
        """Record a failed login attempt"""
        now = time.time()
        self.failed_login_attempts[ip_address].append(now)

        # Remove attempts older than lockout duration
        while (self.failed_login_attempts[ip_address] and
               now - self.failed_login_attempts[ip_address][0] > self.lockout_duration):
            self.failed_login_attempts[ip_address].popleft()

    def is_account_locked(self, ip_address: str) -> bool:
        """Check if account is locked due to too many failed attempts"""
        now = time.time()
        # Remove old attempts
        while (self.failed_login_attempts[ip_address] and
               now - self.failed_login_attempts[ip_address][0] > self.lockout_duration):
            self.failed_login_attempts[ip_address].popleft()

        return len(self.failed_login_attempts[ip_address]) >= self.max_failed_attempts

    def add_security_headers(self, request: Request) -> Dict[str, str]:
        """Add security headers to response"""
        headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",  # or "SAMEORIGIN" if needed
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        }

        # Add CSP header
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.example.com; "  # Replace with your API domains
            "frame-ancestors 'none';"
        )
        headers["Content-Security-Policy"] = csp

        return headers


# Global security middleware instance
security_middleware = SecurityMiddleware()


async def security_middleware_handler(request: Request, call_next):
    """Security middleware handler"""
    # Get client IP
    client_ip = security_middleware.get_client_ip(request)

    # Check rate limiting
    if not security_middleware.check_rate_limit(request):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded"}
        )

    # Check for account lockout on auth endpoints
    if security_middleware.is_login_endpoint(request) and security_middleware.is_account_locked(client_ip):
        return JSONResponse(
            status_code=status.HTTP_423_LOCKED,
            content={"detail": "Account temporarily locked due to too many failed attempts"}
        )

    # Add security headers to response
    response = await call_next(request)

    # Add security headers
    security_headers = security_middleware.add_security_headers(request)
    for header, value in security_headers.items():
        response.headers[header] = value

    # Log the request for security monitoring
    from ..config.logging import log_api_call
    log_api_call(
        endpoint=str(request.url.path),
        method=request.method,
        ip_address=client_ip,
        status_code=response.status_code,
        extra={"user_agent": request.headers.get("user-agent")}
    )

    return response


def validate_input(data: str, max_length: int = 1000, allowed_patterns: Optional[list] = None) -> bool:
    """Basic input validation"""
    if not data or not isinstance(data, str):
        return False

    if len(data) > max_length:
        return False

    # Check for dangerous patterns
    dangerous_patterns = [
        r'<script', r'javascript:', r'vbscript:', r'on\w+\s*=',
        r'<iframe', r'<object', r'<embed', r'<form'
    ]

    import re
    for pattern in dangerous_patterns:
        if re.search(pattern, data, re.IGNORECASE):
            return False

    # Check against allowed patterns if provided
    if allowed_patterns:
        for pattern in allowed_patterns:
            if not re.match(pattern, data):
                return False

    return True


def sanitize_input(data: str) -> str:
    """Basic input sanitization"""
    if not data or not isinstance(data, str):
        return data

    import html
    # Escape HTML characters
    sanitized = html.escape(data)

    # Remove potentially dangerous characters/sequences
    dangerous_sequences = [
        ('<', '&lt;'),
        ('>', '&gt;'),
        ('"', '&quot;'),
        ("'", '&#x27;'),
        ('/', '&#x2F;'),
    ]

    for old, new in dangerous_sequences:
        sanitized = sanitized.replace(old, new)

    return sanitized