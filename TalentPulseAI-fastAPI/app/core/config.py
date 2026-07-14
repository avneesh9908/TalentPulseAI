from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    VECTOR_DB_URL: str = ""
    # Backward-compatible alias (legacy key); prefer VECTOR_DB_URL.
    VECTOR_DATABASE_URL: str = ""

    @property
    def resolved_vector_db_url(self) -> str:
        return self.VECTOR_DB_URL or self.VECTOR_DATABASE_URL or self.DATABASE_URL

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
    # Toggle LLM-based intelligent resume parsing (extracts interview-relevant content,
    # excludes PII like name/phone/email/address/location); falls back to heuristic parser
    ENABLE_LLM_RESUME_PARSING: bool = True
    # OCR scanned/image-based PDFs via Gemini vision when pypdf finds no text layer
    ENABLE_PDF_OCR: bool = True
    # Web research (Gemini + Google Search grounding) on questions commonly asked
    # for the candidate's role/experience; blended into question generation
    ENABLE_QUESTION_RESEARCH: bool = True

    # Cursor (legacy — only used when EMBEDDING_PROVIDER=cursor)
    CURSOR_API_KEY: str = ""
    CURSOR_API_BASE_URL: str = "https://api.cursor.sh/v1"
    CURSOR_EMBEDDING_MODEL: str = "text-embedding-3-small"

    RAG_COLLECTION: str = "talentpulse_resume_chunks"

    # ── Job Search Agent ──────────────────────────────────────────────────────
    ENABLE_JOB_SEARCH: bool = True
    # HTTP timeout (seconds) for outbound ATS career-page API calls.
    JOB_SEARCH_HTTP_TIMEOUT: int = 20
    # Max job listings pulled per company per fetch (safety cap).
    JOB_SEARCH_MAX_PER_COMPANY: int = 200
    # Separate vector collection for job-description embeddings (kept apart from
    # resume chunks so the two never collide in similarity search).
    JOB_LISTINGS_COLLECTION: str = "talentpulse_job_listings"

    class Config:
        env_file = ".env"
        # Deploy-only env vars (e.g. ALLOWED_ORIGINS, read directly in main.py) live in
        # .env too; ignore them here instead of failing startup on unknown keys.
        extra = "ignore"

settings = Settings()