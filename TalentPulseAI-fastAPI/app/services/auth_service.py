from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.core.security import DUMMY_PASSWORD_HASH, hash_password, verify_password
from app.models.user import User


def signup_user(data, db: Session) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        # Registration UX requires telling the user the email is taken; this is an
        # accepted enumeration tradeoff (login below does NOT leak existence).
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(email=data.email, password=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {"message": "User registered", "access_token": token, "token_type": "bearer"}


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
    return {"access_token": token, "token_type": "bearer"}
