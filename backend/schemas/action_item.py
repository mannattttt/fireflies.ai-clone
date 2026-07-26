"""Pydantic schemas for ActionItem."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ActionItemCreate(BaseModel):
    """Used when adding a new action item to a meeting."""
    text: str
    assignee: Optional[str] = None


class ActionItemUpdate(BaseModel):
    """Used when editing an existing action item."""
    text: Optional[str] = None
    assignee: Optional[str] = None
    is_completed: Optional[bool] = None


class ActionItemResponse(BaseModel):
    """Action item returned from the API."""
    id: int
    meeting_id: int
    text: str
    assignee: Optional[str]
    is_completed: bool
    created_at: datetime

    model_config = {"from_attributes": True}
