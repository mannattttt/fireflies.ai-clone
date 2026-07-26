"""
Tag model + many-to-many join table with meetings.
Tags are optional labels that can be applied to meetings for filtering.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship

from db import Base

# Many-to-many join table: which tags are on which meetings
meeting_tags = Table(
    "meeting_tags",
    Base.metadata,
    Column("meeting_id", Integer, ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    meetings = relationship(
        "Meeting",
        secondary=meeting_tags,
        back_populates="tags",
    )
