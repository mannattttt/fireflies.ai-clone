"""
KeyTopic model — a short topic/chapter label for a meeting.
Each meeting can have 2-5 key topics extracted from its transcript.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from db import Base


class KeyTopic(Base):
    __tablename__ = "key_topics"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    topic_text = Column(String(500), nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="key_topics")
