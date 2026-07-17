import uuid

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.db import Base


def _gen_public_id() -> str:
    """Stable, non-sequential external identifier (used for profile/interviews/etc.)."""
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    # Internal DB key (FK target across tables — unchanged).
    id = Column(Integer, primary_key=True, index=True)
    # Public per-user handle — the unique id surfaced to the client and used as the
    # external reference for a user's profile, interviews, and everything else.
    public_id = Column(String, unique=True, index=True, nullable=False, default=_gen_public_id)
    email = Column(String, unique=True, index=True, nullable=False)
    # Required + unique at the register API (email/password signup). Column is
    # nullable so pre-existing rows created before this field don't break; the
    # service layer enforces presence for new signups.
    phone = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    password = Column(String, nullable=False)

    # Relationships
    profile     = relationship("Profile", back_populates="user", uselist=False)
    education   = relationship("Education", back_populates="user")
    skills      = relationship("Skill", back_populates="user")
    documents   = relationship("Document", back_populates="user")
    preferences = relationship("CareerPreferences", back_populates="user", uselist=False)
    interviews  = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
