-- Phase 4: Embedding dedup
-- Run this once against your dev/prod database if it already has rows.
-- create_all will handle brand-new installs; this is only needed for existing DBs.

ALTER TABLE resume_documents
    ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

CREATE INDEX IF NOT EXISTS ix_resume_documents_content_hash
    ON resume_documents (content_hash);

-- embedding_cache is a new table — create_all will create it automatically,
-- but this is here for explicit reference / manual runs.
CREATE TABLE IF NOT EXISTS embedding_cache (
    id                       SERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL REFERENCES users(id),
    content_hash             VARCHAR(64) NOT NULL,
    source_resume_document_id INTEGER NOT NULL REFERENCES resume_documents(id),
    chunk_count              INTEGER NOT NULL DEFAULT 0,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_embedding_cache_user_hash UNIQUE (user_id, content_hash)
);

CREATE INDEX IF NOT EXISTS ix_embedding_cache_user_id     ON embedding_cache (user_id);
CREATE INDEX IF NOT EXISTS ix_embedding_cache_content_hash ON embedding_cache (content_hash);
