from pydantic import BaseModel
from typing import Optional, List, Generic, TypeVar, Dict, Any
from enum import Enum


T = TypeVar('T')


class ResponseStatus(str Enum):
    SUCCESS = "success"
    ERROR = "error"


class BaseResponse(BaseModel):
    """Base response model for all API responses."""
    status: ResponseStatus
    message: str
    data: Optional[Dict[str, Any]] = None


class ListResponse(BaseModel, Generic[T]):
    """Response model for list endpoints."""
    items: List[T]
    total: int
    page: Optional[int] = None
    limit: Optional[int] = None


class TokenResponse(BaseModel):
    """Response model for authentication tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: Optional[int] = None


class TokenData(BaseModel):
    """Data model for token payload."""
    username: Optional[str] = None
    user_id: Optional[int] = None
    scopes: List[str] = []


class ErrorResponse(BaseModel):
    """Response model for error cases."""
    status: ResponseStatus = ResponseStatus.ERROR
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class SuccessResponse(BaseModel):
    """Response model for successful operations."""
    status: ResponseStatus = ResponseStatus.SUCCESS
    message: str
    data: Optional[Dict[str, Any]] = None


class HealthCheckResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    timestamp: str
    version: Optional[str] = None
    uptime: Optional[str] = None