"""
Rate Limiter Service

Implements token bucket rate limiting with Redis:
- 100 requests per minute per user (default)
- Configurable limits per endpoint
- Rate limit headers (X-RateLimit-*)
- HTTP 429 responses
- Redis-based distributed rate limiting

Algorithm: Token Bucket
- Tokens are added at a fixed rate (refill_rate)
- Each request consumes 1 token
- If no tokens available, request is rejected
"""

import time
from typing import Optional, Tuple
from datetime import datetime, timedelta

try:
    import redis
    from redis.client import Redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    Redis = None

from ..config import settings


class RateLimiter:
    """
    Token bucket rate limiter using Redis.

    Implements:
    - Token bucket algorithm
    - Per-user rate limiting
    - Configurable limits
    - Rate limit headers
    """

    def __init__(
        self,
        redis_client: Optional['Redis'] = None,
        max_requests: int = 100,
        window_seconds: int = 60,
    ):
        """
        Initialize rate limiter.

        Args:
            redis_client: Redis client instance
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
        """
        self.redis_client = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.enabled = redis_client is not None and REDIS_AVAILABLE

    def _get_key(self, user_id: str, endpoint: str = "default") -> str:
        """Generate Redis key for rate limiting."""
        return f"rate_limit:{user_id}:{endpoint}"

    def check_rate_limit(
        self,
        user_id: str,
        endpoint: str = "default",
    ) -> Tuple[bool, int, int, int]:
        """
        Check if request should be allowed.

        Args:
            user_id: User identifier
            endpoint: Optional endpoint identifier for per-endpoint limits

        Returns:
            Tuple of (allowed, remaining, limit, reset_time)
            - allowed: Whether request is allowed
            - remaining: Requests remaining in window
            - limit: Maximum requests allowed
            - reset_time: Unix timestamp when limit resets
        """
        if not self.enabled:
            # Rate limiting disabled, allow all requests
            return (True, self.max_requests, self.max_requests, 0)

        key = self._get_key(user_id, endpoint)
        current_time = int(time.time())
        window_start = current_time - self.window_seconds

        try:
            pipe = self.redis_client.pipeline()

            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, window_start)

            # Count requests in current window
            pipe.zcard(key)

            # Get results
            results = pipe.execute()
            request_count = results[1]

            # Check if limit exceeded
            if request_count >= self.max_requests:
                # Get oldest request timestamp to calculate reset time
                oldest = self.redis_client.zrange(key, 0, 0, withscores=True)
                if oldest:
                    reset_time = int(oldest[0][1]) + self.window_seconds
                else:
                    reset_time = current_time + self.window_seconds

                return (False, 0, self.max_requests, reset_time)

            # Add current request
            self.redis_client.zadd(key, {str(current_time): current_time})

            # Set expiry on key
            self.redis_client.expire(key, self.window_seconds)

            # Calculate remaining requests
            remaining = self.max_requests - request_count - 1
            reset_time = current_time + self.window_seconds

            return (True, remaining, self.max_requests, reset_time)

        except Exception as e:
            # On Redis error, fail open (allow request)
            print(f"Rate limiter error: {e}")
            return (True, self.max_requests, self.max_requests, 0)

    def reset_limit(self, user_id: str, endpoint: str = "default") -> None:
        """
        Reset rate limit for a user/endpoint.

        Useful for testing or manual resets.
        """
        if not self.enabled:
            return

        key = self._get_key(user_id, endpoint)
        try:
            self.redis_client.delete(key)
        except Exception as e:
            print(f"Error resetting rate limit: {e}")


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """
    Get or create global rate limiter instance.

    Returns:
        RateLimiter instance
    """
    global _rate_limiter

    if _rate_limiter is None:
        # Initialize Redis client if URL provided
        redis_client = None
        if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL and REDIS_AVAILABLE:
            try:
                redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                )
                # Test connection
                redis_client.ping()
                print("✓ Redis connected for rate limiting")
            except Exception as e:
                print(f"Warning: Could not connect to Redis: {e}")
                print("Rate limiting will be disabled")
                redis_client = None
        else:
            if not REDIS_AVAILABLE:
                print("Warning: redis package not installed")
            else:
                print("Warning: REDIS_URL not configured")
            print("Rate limiting will be disabled")

        # Create rate limiter
        max_requests = getattr(settings, 'RATE_LIMIT_REQUESTS', 100)
        window_seconds = getattr(settings, 'RATE_LIMIT_WINDOW', 60)

        _rate_limiter = RateLimiter(
            redis_client=redis_client,
            max_requests=max_requests,
            window_seconds=window_seconds,
        )

    return _rate_limiter
