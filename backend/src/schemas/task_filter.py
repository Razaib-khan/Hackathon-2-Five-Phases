from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime
from uuid import UUID
from .task import TaskPriority, TaskStatus


class FilterOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_THAN_OR_EQUAL = "greater_than_or_equal"
    LESS_THAN_OR_EQUAL = "less_than_or_equal"
    IN = "in"
    NOT_IN = "not_in"
    IS_NULL = "is_null"
    IS_NOT_NULL = "is_not_null"


class FilterCondition(BaseModel):
    field: str
    operator: FilterOperator
    value: Any


class TaskFilterConfig(BaseModel):
    title_contains: Optional[str] = None
    description_contains: Optional[str] = None
    statuses: Optional[List[TaskStatus]] = []
    priorities: Optional[List[TaskPriority]] = []
    assigned_to_me: Optional[bool] = None
    created_by_me: Optional[bool] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    completed_from: Optional[datetime] = None
    completed_to: Optional[datetime] = None
    tags: Optional[List[str]] = []  # List of tag IDs
    is_public: Optional[bool] = None
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"  # asc or desc
    limit: Optional[int] = 100
    custom_conditions: Optional[List[FilterCondition]] = []


class TaskFilterCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    filter_config: TaskFilterConfig
    is_default: Optional[bool] = False


class TaskFilterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    filter_config: Optional[TaskFilterConfig] = None
    is_default: Optional[bool] = None


class TaskFilterResponse(BaseModel):
    id: UUID
    name: str
    filter_config: TaskFilterConfig
    is_default: bool
    created_at: datetime
    updated_at: datetime
    user_id: UUID

    class Config:
        from_attributes = True


class TaskFilterListRequest(BaseModel):
    include_default: Optional[bool] = True
    limit: Optional[int] = 100
    offset: Optional[int] = 0


class TaskFilterApplyRequest(BaseModel):
    filter_id: Optional[str] = None  # ID of saved filter to apply
    filter_config: Optional[TaskFilterConfig] = None  # Direct filter config to apply
    search_query: Optional[str] = None  # Additional search query
    limit: Optional[int] = 100
    offset: Optional[int] = 0