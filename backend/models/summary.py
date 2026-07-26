"""
Summary model — one-to-one with a meeting.
Stores the AI-generated (or mock-generated) overview text.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from db import Base


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview_text = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")
