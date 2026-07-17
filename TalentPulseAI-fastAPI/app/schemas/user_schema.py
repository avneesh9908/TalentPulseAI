import re

from typing import Optional

from pydantic import BaseModel, Field, field_validator

# Pragmatic email check — avoids adding the `email-validator` dependency (not installed)
# while still rejecting obviously malformed addresses.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Phone: optional leading +, then 7–15 digits; spaces/hyphens/parens allowed as separators.
_PHONE_RE = re.compile(r"^\+?[0-9][0-9\s\-()]{6,18}$")


def _normalize_email(value: str) -> str:
    value = (value or "").strip().lower()
    if not _EMAIL_RE.match(value):
        raise ValueError("Invalid email address")
    return value


def _normalize_phone(value: str) -> str:
    value = (value or "").strip()
    if not _PHONE_RE.match(value):
        raise ValueError("Invalid phone number")
    # Canonicalize storage/uniqueness: keep an optional leading '+' and digits only,
    # so "+91 98765 43210" and "+919876543210" are treated as the same number.
    digits = re.sub(r"[^\d]", "", value)
    return ("+" if value.lstrip().startswith("+") else "") + digits


class UserCreate(BaseModel):
    email: str
    phone: str
    password: str = Field(min_length=8, max_length=72)
    full_name: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return _normalize_phone(v)

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, v: Optional[str]) -> Optional[str]:
        v = (v or "").strip()
        return v or None


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _normalize_email(v)
