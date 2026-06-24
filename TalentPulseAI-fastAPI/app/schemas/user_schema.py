import re

from pydantic import BaseModel, Field, field_validator

# Pragmatic email check — avoids adding the `email-validator` dependency (not installed)
# while still rejecting obviously malformed addresses.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(value: str) -> str:
    value = (value or "").strip().lower()
    if not _EMAIL_RE.match(value):
        raise ValueError("Invalid email address")
    return value


class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)
