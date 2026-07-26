"""Pydantic schemas for KeyTopic."""

from pydantic import BaseModel


class KeyTopicResponse(BaseModel):
    """A key topic/chapter label for a meeting."""
    id: int
    meeting_id: int
    topic_text: str
    order_index: int

    model_config = {"from_attributes": True}
