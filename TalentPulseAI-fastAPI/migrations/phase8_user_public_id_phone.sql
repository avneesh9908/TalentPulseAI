-- Phase 8: add public_id (unique external handle), phone (unique, required at
-- signup), and full_name to users. create_all makes these on a fresh DB; run
-- this on existing DBs (create_all never ALTERs existing tables).
-- Postgres. gen_random_uuid() needs pgcrypto (built in on Supabase/PG13+).

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone     VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;

-- Backfill public_id for rows created before this column existed.
UPDATE users
   SET public_id = replace(gen_random_uuid()::text, '-', '')
 WHERE public_id IS NULL;

-- public_id is required going forward.
ALTER TABLE users ALTER COLUMN public_id SET NOT NULL;

-- Uniqueness (phone left nullable so legacy rows without a phone are allowed;
-- Postgres permits multiple NULLs under a UNIQUE index).
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_public_id ON users (public_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone     ON users (phone);

COMMIT;
