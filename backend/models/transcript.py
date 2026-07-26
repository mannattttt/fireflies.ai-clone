"""
TranscriptSegment model — one line/utterance in a meeting transcript.
Each segment has a speaker name, start/end times (in seconds),
the spoken text, and an order_index for display ordering.
"""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from db import Base


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker_name = Column(String(255), nullable=False)
    start_time = Column(Float, nullable=False)  # seconds from meeting start
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="transcript_segments")
