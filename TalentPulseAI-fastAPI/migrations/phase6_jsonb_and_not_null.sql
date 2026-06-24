-- Phase 6: JSON -> JSONB + NOT NULL constraints on users
-- Run this once against an EXISTING database. create_all handles brand-new
-- installs; it does NOT alter existing columns, so this is required for dev/prod
-- DBs that already have these tables.
--
-- Safe to run multiple times: type changes are idempotent; the NOT NULL steps
-- will error only if rows with NULL email/password exist (clean those first).

-- 1. users: enforce NOT NULL on credentials (clean up any NULL rows first)
-- DELETE FROM users WHERE email IS NULL OR password IS NULL;  -- uncomment if needed
ALTER TABLE users ALTER COLUMN email    SET NOT NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- 2. interviews: JSON -> JSONB
ALTER TABLE interviews ALTER COLUMN skills   TYPE JSONB USING skills::jsonb;
ALTER TABLE interviews ALTER COLUMN answers  TYPE JSONB USING answers::jsonb;
ALTER TABLE interviews ALTER COLUMN feedback TYPE JSONB USING feedback::jsonb;

-- 3. resume_documents: JSON -> JSONB
ALTER TABLE resume_documents ALTER COLUMN skills          TYPE JSONB USING skills::jsonb;
ALTER TABLE resume_documents ALTER COLUMN parsed_sections TYPE JSONB USING parsed_sections::jsonb;
ALTER TABLE resume_documents ALTER COLUMN parsed_summary  TYPE JSONB USING parsed_summary::jsonb;

-- 4. resume_chunks: JSON -> JSONB
ALTER TABLE resume_chunks ALTER COLUMN metadata_json TYPE JSONB USING metadata_json::jsonb;
