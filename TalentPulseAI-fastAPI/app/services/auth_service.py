from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.core.security import DUMMY_PASSWORD_HASH, hash_password, verify_password
from app.models.user import User


def _user_public(user: User) -> dict:
    """The account fields the client persists and uses as the external handle."""
    return {
        "public_id": user.public_id,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
    }


def signup_user(data, db: Session) -> dict:
    if db.query(User).filter(User.email == data.email).first():
        # Registration UX requires telling the user the email is taken; this is an
        # accepted enumeration tradeoff (login below does NOT leak existence).
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Phone is mandatory for email/password signup and identifies one user.
    if not getattr(data, "phone", None):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Phone number is required.",
        )
    if db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number already exists.",
        )

    user = User(
        email=data.email,
        phone=data.phone,
        full_name=getattr(data, "full_name", None),
        password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {
        "message": "User registered",
        "access_token": token,
        "token_type": "bearer",
        "user": _user_public(user),
    }


def login_user(data, db: Session) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    # Always run a hash verification — even when the user is absent — so response
    # timing doesn't reveal whether an email is registered.
    hashed = user.password if user else DUMMY_PASSWORD_HASH
    password_ok = verify_password(data.password, hashed)

    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": _user_public(user)}
