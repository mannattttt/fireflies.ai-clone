"""
Pydantic schemas for Meeting — the main entity.
Includes list (summary) and detail (full) response shapes.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

from schemas.participant import ParticipantBase, ParticipantResponse
from schemas.transcript import TranscriptSegmentResponse
from schemas.summary import SummaryResponse
from schemas.topic import KeyTopicResponse
from schemas.action_item import ActionItemResponse


class MeetingCreate(BaseModel):
    """
    Used when creating a new meeting.
    transcript_text is optional — if provided, it gets parsed into segments.
    participants is a list of {name, email} objects.
    """
    title: str
    date: datetime
    duration_seconds: int = 0
    participants: List[ParticipantBase] = []
    transcript_text: Optional[str] = None  # pasted raw transcript


class MeetingUpdate(BaseModel):
    """Used when editing meeting metadata."""
    title: Optional[str] = None
    date: Optional[datetime] = None
    participants: Optional[List[ParticipantBase]] = None


class MeetingListItem(BaseModel):
    """
    Lightweight meeting representation for the dashboard list.
    Doesn't include transcript/summary — just metadata + participant names.
    """
    id: int
    title: str
    date: datetime
    duration_seconds: int
    created_at: datetime
    participants: List[ParticipantResponse]
    action_item_count: int = 0
    has_summary: bool = False

    model_config = {"from_attributes": True}


class MeetingDetail(BaseModel):
    """
    Full meeting representation for the detail page.
    Includes everything: transcript, summary, topics, action items.
    """
    id: int
    title: str
    date: datetime
    duration_seconds: int
    media_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse]
    transcript_segments: List[TranscriptSegmentResponse]
    summary: Optional[SummaryResponse]
    key_topics: List[KeyTopicResponse]
    action_items: List[ActionItemResponse]

    model_config = {"from_attributes": True}
