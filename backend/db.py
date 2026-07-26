"""
Database configuration — SQLAlchemy engine, session, and base model.
Uses SQLite for simplicity (single-file database, no server needed).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite database file lives next to the backend code
DATABASE_URL = "sqlite:///./meetings.db"

# connect_args needed for SQLite to allow multi-threaded access from FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Each request gets its own session via dependency injection
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def get_db():
    """
    FastAPI dependency that provides a database session per request.
    Automatically closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
