"""Pydantic schemas for TranscriptSegment."""

from pydantic import BaseModel


class TranscriptSegmentResponse(BaseModel):
    """A single transcript line returned from the API."""
    id: int
    meeting_id: int
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    order_index: int

    model_config = {"from_attributes": True}


class TranscriptSearchResult(BaseModel):
    """A matching transcript segment from an in-transcript search."""
    segment_id: int
    meeting_id: int
    order_index: int
    speaker_name: str
    start_time: float
    text: str
    match_start: int  # character offset where the match starts
    match_end: int    # character offset where the match ends
