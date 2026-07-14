"""
Job Search Agent models.

Design notes:
- JobSearchProfile is the user's one-time, re-editable search setup. It links to
  an already-indexed ResumeDocument via `resume_document_id` so matching REUSES
  the resume's existing chunk embeddings — the resume is never re-embedded for
  job search. `target_designations` is a user-overridable list (one resume can
  target many roles, including a role different from the resume's history).
- TargetCompany is the ATS registry (admin-seeded); adding a company is one row,
  not new code, because connectors are keyed by `ats_type` + `board_slug`.
- JobListing is deduped by `content_hash` (same pattern as EmbeddingCache) and by
  the ATS-stable (source, external_id) pair.
- JobMatch is the join of a listing with a user's search; it carries the
  match score/reasons and the assisted-apply status + pending reason.
"""
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base, JSONType


class JobSearchProfile(Base):
    """One saved search setup per user. Re-setup overwrites this row."""
    __tablename__ = "job_search_profiles"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_job_search_profile_user"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # "resume" (upload path, shipped first) or "profile" (existing-profile, later).
    setup_source = Column(String, nullable=False, default="resume")
    # Links to the ALREADY-EMBEDDED resume so job matching reuses its vectors.
    resume_document_id = Column(
        Integer, ForeignKey("resume_documents.id"), nullable=True, index=True
    )

    # User-overridable list of target job titles derived from the resume; e.g.
    # ["MERN Stack Developer", "Python Developer", "Frontend Developer"].
    target_designations = Column(JSONType, nullable=False, default=list)
    # Optional filters.
    locations = Column(JSONType, nullable=False, default=list)
    remote_ok = Column(Boolean, nullable=False, default=True)
    seniority = Column(String, nullable=True)
    min_salary = Column(Integer, nullable=True)

    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user = relationship("User")
    resume_document = relationship("ResumeDocument")
    matches = relationship(
        "JobMatch", back_populates="search_profile", cascade="all, delete-orphan"
    )


class TargetCompany(Base):
    """ATS registry. One connector per `ats_type` covers every company here."""
    __tablename__ = "target_companies"
    __table_args__ = (
        UniqueConstraint("ats_type", "board_slug", name="uq_target_company_ats_slug"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # "greenhouse" | "lever" | "workday"
    ats_type = Column(String, nullable=False, index=True)
    # Board identifier the ATS API expects (e.g. Greenhouse board token).
    board_slug = Column(String, nullable=False)
    careers_url = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class JobListing(Base):
    """A job posting fetched from an ATS. Deduped by (source, external_id) + content_hash."""
    __tablename__ = "job_listings"
    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_job_listing_source_external"),
    )

    id = Column(Integer, primary_key=True, index=True)
    # ATS type the listing came from (matches TargetCompany.ats_type).
    source = Column(String, nullable=False, index=True)
    # Stable ID assigned by the ATS; powers dedup on re-fetch.
    external_id = Column(String, nullable=False)

    company = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    location = Column(String, nullable=True)
    remote = Column(Boolean, nullable=False, default=False)
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    salary = Column(String, nullable=True)
    posted_at = Column(DateTime(timezone=True), nullable=True)

    # SHA-256 of the canonical posting text; detects content changes on re-fetch.
    content_hash = Column(String(64), nullable=True, index=True)

    first_seen_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_seen_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    matches = relationship(
        "JobMatch", back_populates="listing", cascade="all, delete-orphan"
    )


class JobMatch(Base):
    """A listing matched to a user's search, with score and assisted-apply status."""
    __tablename__ = "job_matches"
    __table_args__ = (
        UniqueConstraint("user_id", "job_listing_id", name="uq_job_match_user_listing"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_search_profile_id = Column(
        Integer, ForeignKey("job_search_profiles.id"), nullable=False, index=True
    )
    job_listing_id = Column(
        Integer, ForeignKey("job_listings.id"), nullable=False, index=True
    )

    # Which target designation this listing matched.
    designation = Column(String, nullable=True)
    match_score = Column(Float, nullable=False, default=0.0)
    # {"fits": [...], "gaps": [...]} from the LLM re-rank.
    match_reasons = Column(JSONType, nullable=False, default=dict)

    # new -> reviewed -> pending_apply -> applied -> dismissed
    status = Column(String, nullable=False, default="new", index=True)
    apply_url = Column(String, nullable=True)
    # Why the agent could not safely auto-fill (CAPTCHA / SSO / non-standard form).
    pending_reason = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user = relationship("User")
    search_profile = relationship("JobSearchProfile", back_populates="matches")
    listing = relationship("JobListing", back_populates="matches")
