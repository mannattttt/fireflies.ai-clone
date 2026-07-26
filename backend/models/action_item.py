"""
ActionItem model — a task extracted from a meeting.
Can optionally have an assignee and tracks completion status.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from db import Base


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    assignee = Column(String(255), nullable=True)  # who is responsible
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")
