-- Phase 7 — Job Search Agent schema (PostgreSQL, app DB on port 5432).
-- No Alembic: create_all makes these on a fresh DB; run this on existing DBs.
-- Safe to re-run (IF NOT EXISTS everywhere).

-- Saved search setup, one per user. Links to an already-embedded resume so job
-- matching reuses its vectors instead of re-embedding.
CREATE TABLE IF NOT EXISTS job_search_profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    setup_source        VARCHAR NOT NULL DEFAULT 'resume',
    resume_document_id  INTEGER REFERENCES resume_documents(id),
    target_designations JSONB   NOT NULL DEFAULT '[]'::jsonb,
    locations           JSONB   NOT NULL DEFAULT '[]'::jsonb,
    remote_ok           BOOLEAN NOT NULL DEFAULT TRUE,
    seniority           VARCHAR,
    min_salary          INTEGER,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_job_search_profile_user UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS ix_job_search_profiles_user_id ON job_search_profiles(user_id);
CREATE INDEX IF NOT EXISTS ix_job_search_profiles_resume_document_id ON job_search_profiles(resume_document_id);

-- ATS registry. One connector per ats_type covers every company here.
CREATE TABLE IF NOT EXISTS target_companies (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR NOT NULL,
    ats_type     VARCHAR NOT NULL,
    board_slug   VARCHAR NOT NULL,
    careers_url  VARCHAR,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_target_company_ats_slug UNIQUE (ats_type, board_slug)
);
CREATE INDEX IF NOT EXISTS ix_target_companies_ats_type ON target_companies(ats_type);

-- Fetched job postings, deduped by (source, external_id) + content_hash.
CREATE TABLE IF NOT EXISTS job_listings (
    id             SERIAL PRIMARY KEY,
    source         VARCHAR NOT NULL,
    external_id    VARCHAR NOT NULL,
    company        VARCHAR NOT NULL,
    title          VARCHAR NOT NULL,
    location       VARCHAR,
    remote         BOOLEAN NOT NULL DEFAULT FALSE,
    url            VARCHAR NOT NULL,
    description    TEXT,
    salary         VARCHAR,
    posted_at      TIMESTAMPTZ,
    content_hash   VARCHAR(64),
    first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_job_listing_source_external UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS ix_job_listings_source ON job_listings(source);
CREATE INDEX IF NOT EXISTS ix_job_listings_company ON job_listings(company);
CREATE INDEX IF NOT EXISTS ix_job_listings_content_hash ON job_listings(content_hash);

-- Listing x user match, with score, reasons, and assisted-apply status.
CREATE TABLE IF NOT EXISTS job_matches (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL REFERENCES users(id),
    job_search_profile_id INTEGER NOT NULL REFERENCES job_search_profiles(id),
    job_listing_id        INTEGER NOT NULL REFERENCES job_listings(id),
    designation           VARCHAR,
    match_score           DOUBLE PRECISION NOT NULL DEFAULT 0,
    match_reasons         JSONB NOT NULL DEFAULT '{}'::jsonb,
    status                VARCHAR NOT NULL DEFAULT 'new',
    apply_url             VARCHAR,
    pending_reason        VARCHAR,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_job_match_user_listing UNIQUE (user_id, job_listing_id)
);
CREATE INDEX IF NOT EXISTS ix_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS ix_job_matches_search_profile ON job_matches(job_search_profile_id);
CREATE INDEX IF NOT EXISTS ix_job_matches_listing ON job_matches(job_listing_id);
CREATE INDEX IF NOT EXISTS ix_job_matches_status ON job_matches(status);
