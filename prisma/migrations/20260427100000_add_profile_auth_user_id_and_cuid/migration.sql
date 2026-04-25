-- Step 1/7 of the Profile schema overhaul (issue #69).
--
-- Goal: split auth identifier off the primary key and prepare a TEXT id_new
-- column that will become the new cuid-style PK in step 3. We do NOT touch
-- foreign keys yet — those move to id_new in step 2 once every profile has a
-- non-null id_new value.
--
-- Idempotent UPDATE: WHERE clauses guard against re-running the data fill.
-- The id_new value is derived deterministically from the existing UUID so
-- repeating the migration produces the same string per row.

-- 1. Add the new columns as nullable so existing rows stay valid until they
--    are backfilled.
ALTER TABLE "profiles"
  ADD COLUMN "auth_user_id" UUID,
  ADD COLUMN "id_new"       TEXT;

-- 2. Backfill: auth_user_id mirrors the legacy id (which today equals
--    auth.users.id), and id_new is a deterministic 25-char value
--    ('c' + first 24 hex chars of the UUID) that is collision-resistant at
--    MVP scale and shaped like a cuid for downstream code.
UPDATE "profiles"
   SET "auth_user_id" = "id",
       "id_new"       = 'c' || substring(replace("id"::text, '-', ''), 1, 24)
 WHERE "auth_user_id" IS NULL OR "id_new" IS NULL;

-- 3. Now that every row has values, lock them in.
ALTER TABLE "profiles"
  ALTER COLUMN "auth_user_id" SET NOT NULL,
  ALTER COLUMN "id_new"       SET NOT NULL;

-- 4. Indexes that match Prisma's default naming so step 7 (schema sync) does
--    not generate spurious diffs. The plain index on auth_user_id duplicates
--    the unique index intentionally — Prisma's @@index([authUserId]) emits
--    both, and we want this migration to leave the DB in the exact shape
--    the schema describes.
CREATE UNIQUE INDEX "profiles_auth_user_id_key" ON "profiles"("auth_user_id");
CREATE INDEX        "profiles_auth_user_id_idx" ON "profiles"("auth_user_id");
CREATE UNIQUE INDEX "profiles_id_new_key"       ON "profiles"("id_new");
