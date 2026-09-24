"""
User-facing account data. Everything here is scoped to the authenticated user:
callers pass the User resolved from the JWT, never a client-supplied id.
"""
from typing import Dict

from sqlalchemy.orm import Session

from app.models.user import User
from app.services import interview_service, job_search_service

# The score at or above which an attempt counts as a pass. Not a new idea: the
# result page and the profile page already band scores at 65 and 80, and this is
# the lower of those two bands. Kept here so the dashboard's Passed/Failed split
# and those bands can never drift apart.
PASS_SCORE = 65


def get_overview(db: Session, user: User) -> Dict:
    """Profile-page payload: identity + interview history/status + indexed resumes."""
    interviews = interview_service.list_interviews(db, user.id)
    completed = [i for i in interviews if i["status"] == "submitted"]
    scores = [i["score"] for i in completed if isinstance(i["score"], (int, float))]
    # Oldest → newest, so a chart can plot it left to right without re-sorting.
    # `completed` arrives newest-first; only scored rows can appear on a trend.
    scored = [i for i in completed if isinstance(i["score"], (int, float))]
    score_trend = [
        {
            "interview_id": i["interview_id"],
            "role": i["role"],
            "score": i["score"],
            "completed_at": i["completed_at"],
        }
        for i in reversed(scored)
    ]
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
            # Split of the *scored* attempts. Unscored submissions are in neither.
            "passed": sum(1 for s in scores if s >= PASS_SCORE),
            "failed": sum(1 for s in scores if s < PASS_SCORE),
            "pass_score": PASS_SCORE,
        },
        "latest_interview": interviews[0] if interviews else None,
        "latest_completed": completed[0] if completed else None,
        # Scored interviews only — these are the ones with a report to open.
        # stats.completed is the true total, so the client can disclose truncation.
        "recent_completed": completed[:5],
        # Every scored attempt, oldest first — the dashboard's performance chart.
        "score_trend": score_trend,
        "resumes": job_search_service.list_resumes(db, user.id),
    }
