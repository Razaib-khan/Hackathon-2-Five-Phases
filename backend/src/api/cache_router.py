from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from ..services.cache_service import cache_service
from ..config.database import get_db
from ..config.auth import get_current_user
from ..models.user import User


router = APIRouter()


@router.get("/admin/cache/status")
async def get_cache_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cache status (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view cache status"
        )

    if cache_service.connected:
        try:
            info = cache_service.redis_client.info()
            return {
                "status": "connected",
                "connected": True,
                "redis_version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_commands_processed": info.get("total_commands_processed")
            }
        except Exception as e:
            return {
                "status": "connection_error",
                "connected": False,
                "error": str(e)
            }
    else:
        return {
            "status": "using_fallback",
            "connected": False,
            "fallback_used": True,
            "message": "Redis not available, using in-memory cache"
        }


@router.get("/admin/cache/stats")
async def get_cache_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cache statistics (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view cache stats"
        )

    if cache_service.connected:
        try:
            info = cache_service.redis_client.info()
            return {
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": info.get("keyspace_hits", 0) / (info.get("keyspace_hits", 0) + info.get("keyspace_misses", 1)) * 100,
                "used_memory": info.get("used_memory_human"),
                "memory_peak": info.get("used_memory_peak_human"),
                "total_connections_received": info.get("total_connections_received"),
                "evicted_keys": info.get("evicted_keys", 0)
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting cache stats: {str(e)}"
            )
    else:
        # Return stats for fallback cache
        fallback_size = len(getattr(cache_service, 'fallback_cache', {}))
        return {
            "keyspace_hits": "N/A",
            "keyspace_misses": "N/A",
            "hit_rate": "N/A",
            "used_memory": f"{fallback_size} entries",
            "memory_peak": "N/A",
            "total_connections_received": "N/A",
            "evicted_keys": 0,
            "fallback_cache_size": fallback_size
        }


@router.post("/admin/cache/clear")
async def clear_cache(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear all cache (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can clear cache"
        )

    cache_service.clear()
    return {"message": "Cache cleared successfully"}


@router.get("/admin/cache/keys")
async def get_cache_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get cache keys (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view cache keys"
        )

    if cache_service.connected:
        try:
            keys = cache_service.redis_client.keys("*")
            return {"keys": [key.decode() if isinstance(key, bytes) else key for key in keys]}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting cache keys: {str(e)}"
            )
    else:
        # Return keys for fallback cache
        fallback_keys = list(getattr(cache_service, 'fallback_cache', {}).keys())
        return {"keys": fallback_keys, "source": "fallback_cache"}


@router.delete("/admin/cache/key/{key}")
async def delete_cache_key(
    key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific cache key (admin only)
    """
    if current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete cache keys"
        )

    cache_service.delete(key)
    return {"message": f"Cache key '{key}' deleted successfully"}