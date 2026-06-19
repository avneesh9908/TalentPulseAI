from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt only considers the first 72 bytes of a password and truncates the rest
# silently. Truncate explicitly so hashing/verification are predictable and a
# >72-byte password can never raise inside passlib.
_BCRYPT_MAX_BYTES = 72


def _bcrypt_safe(password: str) -> str:
    return (password or "").encode("utf-8")[:_BCRYPT_MAX_BYTES].decode("utf-8", "ignore")


def hash_password(password: str) -> str:
    return pwd_context.hash(_bcrypt_safe(password))


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_bcrypt_safe(password), hashed_password)


# Pre-computed hash used to keep login timing constant when an email is not found,
# preventing user-enumeration via response timing.
DUMMY_PASSWORD_HASH = pwd_context.hash("constant-time-placeholder-password")
