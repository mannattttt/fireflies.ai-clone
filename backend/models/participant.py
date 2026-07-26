"""
Participant model + many-to-many join table with meetings.
A participant is a person who attended a meeting (name + email).
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship

from db import Base

# Many-to-many join table: which participants attended which meetings
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", Integer, ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("participant_id", Integer, ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True),
)


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)

    # Back-reference to meetings this participant attended
    meetings = relationship(
        "Meeting",
        secondary=meeting_participants,
        back_populates="participants",
    )
