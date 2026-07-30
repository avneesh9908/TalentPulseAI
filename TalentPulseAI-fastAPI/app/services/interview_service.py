from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.interview import Interview
from app.schemas.interview_schema import InterviewSetupRequest
from app.services import scoring_service


def create_interview(db: Session, user_id: int, payload: InterviewSetupRequest) -> Interview:
    interview_id = f"interview_{user_id}_{int(datetime.now(timezone.utc).timestamp())}"
    record = Interview(
        interview_id=interview_id,
        user_id=user_id,
        setup_id=payload.setup_id,
        role=payload.role,
        profile_option=payload.profile_option,
        profile_id=payload.profile_id,
        experience=payload.experience,
        difficulty=payload.difficulty,
        skills=payload.skills,
        status="initialized",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def summarize_interview(record: Interview) -> Dict:
    """Flat per-interview summary used by history/overview endpoints (no answers/feedback payload)."""
    feedback = record.feedback if isinstance(record.feedback, dict) else {}
    return {
        "interview_id": record.interview_id,
        "role": record.role,
        "experience": record.experience,
        "difficulty": record.difficulty,
        "skills": list(record.skills or []),
        "status": record.status,
        "score": feedback.get("score"),
        "started_at": record.started_at.isoformat() if record.started_at else None,
        "completed_at": record.completed_at.isoformat() if record.completed_at else None,
    }


def list_interviews(db: Session, user_id: int, limit: Optional[int] = None) -> List[Dict]:
    query = (
        db.query(Interview)
        .filter(Interview.user_id == user_id)
        .order_by(Interview.id.desc())
    )
    if limit is not None:
        query = query.limit(limit)
    return [summarize_interview(record) for record in query.all()]


def get_interview(db: Session, user_id: int, interview_id: str) -> Optional[Interview]:
    return (
        db.query(Interview)
        .filter(
            Interview.interview_id == interview_id,
            Interview.user_id == user_id,
        )
        .first()
    )


def submit_interview(
    db: Session,
    user_id: int,
    interview_id: str,
    answers: Dict,
    questions: Optional[List[Dict]] = None,
) -> Optional[Tuple[Dict, str]]:
    """Score and persist a completed interview. Returns (feedback_dict, completed_at_iso) or None if not found."""
    interview = get_interview(db, user_id, interview_id)
    if not interview:
        return None
    feedback = scoring_service.generate_feedback(
        answers=answers,
        skills=interview.skills or [],
        questions=questions or [],
        role=interview.role or "",
        experience=interview.experience or "",
        difficulty=interview.difficulty or "",
    )
    # How many questions were asked only exists in the submit payload. Persist it
    # inside the feedback blob (no new column) so a report reopened later can still
    # say "answered 3 of 8" instead of implying every question was answered.
    if questions:
        feedback["total_questions"] = len(questions)
    interview.status = "submitted"
    interview.answers = answers
    interview.feedback = feedback
    interview.completed_at = datetime.now(timezone.utc)
    db.commit()
    return feedback, interview.completed_at.isoformat()
