"""Pydantic schemas for Participant request/response validation."""

from pydantic import BaseModel


class ParticipantBase(BaseModel):
    """Used when creating/updating a participant (input)."""
    name: str
    email: str


class ParticipantResponse(BaseModel):
    """Returned when reading a participant (output)."""
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}
