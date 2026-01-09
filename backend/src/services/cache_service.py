from typing import Optional, Dict, Any
import redis
import pickle
import json
from datetime import timedelta
import logging
from functools import wraps

from ..config.settings import settings


class CacheService:
    def __init__(self):
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST if hasattr(settings, 'REDIS_HOST') else 'localhost',
                port=settings.REDIS_PORT if hasattr(settings, 'REDIS_PORT') else 6379,
                db=0,
                decode_responses=False  # We'll handle serialization ourselves
            )
            # Test connection
            self.redis_client.ping()
            self.connected = True
        except Exception as e:
            logging.warning(f"Redis connection failed: {e}. Using in-memory cache as fallback.")
            self.redis_client = None
            self.connected = False
            self.fallback_cache = {}  # In-memory fallback cache

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        """
        if self.connected and self.redis_client:
            try:
                value = self.redis_client.get(key)
                if value:
                    return pickle.loads(value)
                return None
            except Exception as e:
                logging.error(f"Cache get error: {e}")
                return self._get_fallback(key)
        else:
            return self._get_fallback(key)

    def set(self, key: str, value: Any, expiration: timedelta = timedelta(hours=1)):
        """
        Set value in cache with expiration
        """
        if self.connected and self.redis_client:
            try:
                serialized_value = pickle.dumps(value)
                self.redis_client.setex(
                    key,
                    expiration,
                    serialized_value
                )
            except Exception as e:
                logging.error(f"Cache set error: {e}")
                self._set_fallback(key, value, expiration)
        else:
            self._set_fallback(key, value, expiration)

    def delete(self, key: str):
        """
        Delete value from cache
        """
        if self.connected and self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception as e:
                logging.error(f"Cache delete error: {e}")
        if hasattr(self, 'fallback_cache'):
            self.fallback_cache.pop(key, None)

    def clear(self):
        """
        Clear all cache
        """
        if self.connected and self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception as e:
                logging.error(f"Cache clear error: {e}")
        if hasattr(self, 'fallback_cache'):
            self.fallback_cache.clear()

    def _get_fallback(self, key: str) -> Optional[Any]:
        """
        Fallback method using in-memory cache
        """
        if hasattr(self, 'fallback_cache'):
            entry = self.fallback_cache.get(key)
            if entry:
                value, expiry = entry
                if expiry is None or expiry > self._get_current_time():
                    return value
                else:
                    # Expired, remove it
                    del self.fallback_cache[key]
        return None

    def _set_fallback(self, key: str, value: Any, expiration: timedelta):
        """
        Fallback method using in-memory cache
        """
        if not hasattr(self, 'fallback_cache'):
            self.fallback_cache = {}

        expiry = self._get_current_time() + expiration.total_seconds() if expiration else None
        self.fallback_cache[key] = (value, expiry)

    def _get_current_time(self) -> float:
        """
        Get current time in seconds since epoch
        """
        import time
        return time.time()

    def cache_result(expiration: timedelta = timedelta(hours=1)):
        """
        Decorator to cache function results
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Create a cache key based on function name and arguments
                cache_key_parts = [func.__name__]

                # Add positional arguments
                for arg in args:
                    cache_key_parts.append(str(arg))

                # Add keyword arguments (sorted for consistency)
                for key, value in sorted(kwargs.items()):
                    cache_key_parts.append(f"{key}:{value}")

                cache_key = ":".join(cache_key_parts)

                # Try to get from cache
                cache_service = CacheService()
                cached_result = cache_service.get(cache_key)

                if cached_result is not None:
                    return cached_result

                # Execute function and cache result
                result = func(*args, **kwargs)
                cache_service.set(cache_key, result, expiration)

                return result

            return wrapper
        return decorator

    def invalidate_pattern(pattern: str):
        """
        Decorator to invalidate cache entries matching a pattern after function execution
        """
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Execute the function first
                result = func(*args, **kwargs)

                # Then invalidate matching cache entries
                cache_service = CacheService()
                if cache_service.connected and cache_service.redis_client:
                    try:
                        keys = cache_service.redis_client.keys(pattern)
                        if keys:
                            cache_service.redis_client.delete(*keys)
                    except Exception as e:
                        logging.error(f"Cache invalidation error: {e}")

                return result

            return wrapper
        return decorator


# Create a global instance
cache_service = CacheService()


# Specific cache methods for common use cases
class UserCache:
    @staticmethod
    def get_user(user_id: str):
        """Get user from cache"""
        return cache_service.get(f"user:{user_id}")

    @staticmethod
    def set_user(user_id: str, user_data: Any, expiration: timedelta = timedelta(hours=1)):
        """Set user in cache"""
        cache_service.set(f"user:{user_id}", user_data, expiration)

    @staticmethod
    def invalidate_user(user_id: str):
        """Invalidate user cache"""
        cache_service.delete(f"user:{user_id}")


class HackathonCache:
    @staticmethod
    def get_hackathon(hackathon_id: str):
        """Get hackathon from cache"""
        return cache_service.get(f"hackathon:{hackathon_id}")

    @staticmethod
    def set_hackathon(hackathon_id: str, hackathon_data: Any, expiration: timedelta = timedelta(hours=1)):
        """Set hackathon in cache"""
        cache_service.set(f"hackathon:{hackathon_id}", hackathon_data, expiration)

    @staticmethod
    def invalidate_hackathon(hackathon_id: str):
        """Invalidate hackathon cache"""
        cache_service.delete(f"hackathon:{hackathon_id}")


class SubmissionCache:
    @staticmethod
    def get_submissions_for_hackathon(hackathon_id: str):
        """Get submissions for hackathon from cache"""
        return cache_service.get(f"submissions:hackathon:{hackathon_id}")

    @staticmethod
    def set_submissions_for_hackathon(hackathon_id: str, submissions_data: Any, expiration: timedelta = timedelta(hours=1)):
        """Set submissions for hackathon in cache"""
        cache_service.set(f"submissions:hackathon:{hackathon_id}", submissions_data, expiration)

    @staticmethod
    def invalidate_submissions_for_hackathon(hackathon_id: str):
        """Invalidate submissions cache for hackathon"""
        cache_service.delete(f"submissions:hackathon:{hackathon_id}")


class TeamCache:
    @staticmethod
    def get_team(team_id: str):
        """Get team from cache"""
        return cache_service.get(f"team:{team_id}")

    @staticmethod
    def set_team(team_id: str, team_data: Any, expiration: timedelta = timedelta(hours=1)):
        """Set team in cache"""
        cache_service.set(f"team:{team_id}", team_data, expiration)

    @staticmethod
    def invalidate_team(team_id: str):
        """Invalidate team cache"""
        cache_service.delete(f"team:{team_id}")