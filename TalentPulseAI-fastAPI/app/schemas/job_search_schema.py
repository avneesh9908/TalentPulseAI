from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DesignationSuggestRequest(BaseModel):
    # Defaults to the user's latest indexed resume when omitted.
    resume_document_id: Optional[int] = None


class DesignationSuggestResponse(BaseModel):
    resume_document_id: int
    designations: List[str]
    source: str  # "llm" | "fallback"


class JobSetupRequest(BaseModel):
    resume_document_id: Optional[int] = None  # default: latest resume
    # User-confirmed target job titles (editable chips; may differ from resume history).
    target_designations: List[str] = Field(default_factory=list, max_length=10)
    locations: List[str] = Field(default_factory=list)
    remote_ok: bool = True
    seniority: Optional[str] = None
    min_salary: Optional[int] = None


class JobSetupResponse(BaseModel):
    id: int
    setup_source: str
    resume_document_id: Optional[int]
    target_designations: List[str]
    locations: List[str]
    remote_ok: bool
    seniority: Optional[str]
    min_salary: Optional[int]
    updated_at: Optional[str] = None


class TargetCompanyIn(BaseModel):
    name: str
    ats_type: str
    board_slug: str
    careers_url: Optional[str] = None


class TargetCompanyOut(TargetCompanyIn):
    id: int
    is_active: bool


class JobSearchRunResponse(BaseModel):
    companies_checked: int
    listings_fetched: int
    new_listings: int
    new_matches: int
    matches_total: int
    message: str


class JobMatchOut(BaseModel):
    id: int
    company: str
    title: str
    location: Optional[str]
    remote: bool
    url: str
    designation: Optional[str]
    match_score: float
    match_reasons: Dict
    status: str
    apply_url: Optional[str]
    pending_reason: Optional[str]
    posted_at: Optional[str]
    created_at: Optional[str]


class JobMatchesResponse(BaseModel):
    total: int
    matches: List[JobMatchOut]


class MatchStatusUpdateRequest(BaseModel):
    status: str  # new | reviewed | pending_apply | applied | dismissed
    pending_reason: Optional[str] = None
