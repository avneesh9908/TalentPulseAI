"""
User-facing account data. Everything here is scoped to the authenticated user:
callers pass the User resolved from the JWT, never a client-supplied id.
"""
from typing import Dict

from sqlalchemy.orm import Session

from app.models.user import User
from app.services import interview_service, job_search_service


def get_overview(db: Session, user: User) -> Dict:
    """Profile-page payload: identity + interview history/status + indexed resumes."""
    interviews = interview_service.list_interviews(db, user.id)
    completed = [i for i in interviews if i["status"] == "submitted"]
    scores = [i["score"] for i in completed if isinstance(i["score"], (int, float))]
    # A row is created the moment the setup wizard finishes, so abandoned setups are
    # common and the newest row is often one of them. Surface the newest *scored*
    # interview separately — that is the one a user means by "my last interview".
    return {
        "user": {
            "public_id": user.public_id,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
        },
        "stats": {
            "total_interviews": len(interviews),
            "completed": len(completed),
            # Set up but never submitted — not necessarily still being taken.
            "unfinished": len(interviews) - len(completed),
            "average_score": round(sum(scores) / len(scores), 1) if scores else None,
            "best_score": max(scores) if scores else None,
        },
        "latest_interview": interviews[0] if interviews else None,
        "latest_completed": completed[0] if completed else None,
        # Scored interviews only — these are the ones with a report to open.
        # stats.completed is the true total, so the client can disclose truncation.
        "recent_completed": completed[:5],
        "resumes": job_search_service.list_resumes(db, user.id),
    }
