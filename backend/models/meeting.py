"""
Meeting model — the core entity. Each meeting has a title, date, duration,
and optional media URL. Related to participants, transcript segments,
summary, key topics, action items, and tags.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship

from db import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    duration_seconds = Column(Integer, nullable=False, default=0)
    media_url = Column(Text, nullable=True)  # placeholder — no real media
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    participants = relationship(
        "Participant",
        secondary="meeting_participants",
        back_populates="meetings",
    )
    transcript_segments = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.order_index",
    )
    summary = relationship(
        "Summary",
        back_populates="meeting",
        uselist=False,  # one-to-one
        cascade="all, delete-orphan",
    )
    key_topics = relationship(
        "KeyTopic",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="KeyTopic.order_index",
    )
    action_items = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
    )
    tags = relationship(
        "Tag",
        secondary="meeting_tags",
        back_populates="meetings",
    )
