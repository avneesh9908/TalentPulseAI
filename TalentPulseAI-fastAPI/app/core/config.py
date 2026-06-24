from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    VECTOR_DB_URL: str = ""
    # Backward-compatible alias (legacy key); prefer VECTOR_DB_URL.
    VECTOR_DATABASE_URL: str = ""
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # Embedding provider: "google" (free tier) or "cursor" (legacy)
    EMBEDDING_PROVIDER: str = "google"

    # Google AI (free) — get key at aistudio.google.com
    GOOGLE_API_KEY: str = ""
    GOOGLE_EMBEDDING_MODEL: str = "models/text-embedding-004"
    # Chat model for question generation — gemini-2.0-flash is on the free tier
    GOOGLE_CHAT_MODEL: str = "gemini-2.0-flash"
    # Toggle LLM question generation; falls back to deterministic templates when off/unavailable
    ENABLE_LLM_QUESTIONS: bool = True

    # Cursor (legacy — only used when EMBEDDING_PROVIDER=cursor)
    CURSOR_API_KEY: str = ""
    CURSOR_API_BASE_URL: str = "https://api.cursor.sh/v1"
    CURSOR_EMBEDDING_MODEL: str = "text-embedding-3-small"

    RAG_COLLECTION: str = "talentpulse_resume_chunks"

    class Config:
        env_file = ".env"

settings = Settings()