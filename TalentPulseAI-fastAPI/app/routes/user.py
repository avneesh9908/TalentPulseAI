from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.deps import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services import user_service

router = APIRouter()


@router.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "public_id": current_user.public_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
    }


@router.get("/overview")
def overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Everything the profile page needs, scoped to the authenticated user."""
    return user_service.get_overview(db, current_user)
