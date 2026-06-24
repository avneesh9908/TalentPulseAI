from sqlalchemy import JSON, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,  # recycle connections every 30 min to avoid stale-connection errors
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Use Postgres JSONB (indexable, faster) where available, plain JSON elsewhere
# (e.g. SQLite in tests). Share a single instance across columns.
JSONType = JSON().with_variant(JSONB, "postgresql")
