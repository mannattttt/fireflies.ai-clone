"""Pydantic schemas for Summary."""

from datetime import datetime
from pydantic import BaseModel


class SummaryResponse(BaseModel):
    """Meeting summary returned from the API."""
    id: int
    meeting_id: int
    overview_text: str
    generated_at: datetime

    model_config = {"from_attributes": True}
