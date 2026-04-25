-- Backfill: existing profiles created before username became required need a
-- deterministic placeholder so the subsequent NOT NULL migration succeeds.
-- The first 12 hex chars (no dashes) of the UUID id give 16^12 distinct values
-- and the id itself is unique, so collisions are practically impossible at
-- MVP-scale user counts. Users can rename via /me/edit.
UPDATE "profiles"
SET "username" = 'user_' || substring(replace("id"::text, '-', ''), 1, 12)
WHERE "username" IS NULL;
