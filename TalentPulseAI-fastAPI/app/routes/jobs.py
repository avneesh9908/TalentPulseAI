"""
Job Search routes — thin HTTP glue delegating to job_search_service.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.deps import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.job_search_schema import (
    DesignationSuggestRequest,
    DesignationSuggestResponse,
    ResumeOption,
    JobMatchesResponse,
    JobMatchOut,
    JobSearchRunResponse,
    JobSetupRequest,
    JobSetupResponse,
    MatchStatusUpdateRequest,
    TargetCompanyIn,
    TargetCompanyOut,
)
from app.services import job_search_service


def _require_job_search_enabled() -> None:
    if not settings.ENABLE_JOB_SEARCH:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Job search is disabled (ENABLE_JOB_SEARCH=false)",
        )


router = APIRouter(dependencies=[Depends(_require_job_search_enabled)])


@router.post("/designations/suggest", response_model=DesignationSuggestResponse)
def suggest_designations(
    payload: DesignationSuggestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return job_search_service.suggest_designations(
            db, current_user.id, payload.resume_document_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Designation suggestion failed: {e}",
        )


@router.get("/resumes", response_model=List[ResumeOption])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Resumes available to the job agent — the job side picks its own."""
    return job_search_service.list_resumes(db, current_user.id)


@router.get("/setup", response_model=JobSetupResponse)
def get_setup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = job_search_service.get_setup(db, current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No job search setup yet — complete setup first",
        )
    return job_search_service.setup_response(profile)


@router.post("/setup", response_model=JobSetupResponse)
def save_setup(
    payload: JobSetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        profile = job_search_service.save_setup(db, current_user.id, payload)
        return job_search_service.setup_response(profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job search setup failed: {e}",
        )


@router.get("/companies", response_model=List[TargetCompanyOut])
def list_companies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return job_search_service.list_companies(db)


@router.post("/companies", response_model=TargetCompanyOut, status_code=status.HTTP_201_CREATED)
def add_company(
    payload: TargetCompanyIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return job_search_service.add_company(db, payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add company: {e}",
        )


@router.post("/search", response_model=JobSearchRunResponse)
def run_search(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return job_search_service.run_search(db, current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job search run failed: {e}",
        )


@router.get("/matches", response_model=JobMatchesResponse)
def list_matches(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    matches = job_search_service.list_matches(db, current_user.id, status_filter)
    return {"total": len(matches), "matches": matches}


@router.patch("/matches/{match_id}", response_model=JobMatchOut)
def update_match_status(
    match_id: int,
    payload: MatchStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return job_search_service.update_match_status(
        db, current_user.id, match_id, payload.status, payload.pending_reason
    )
