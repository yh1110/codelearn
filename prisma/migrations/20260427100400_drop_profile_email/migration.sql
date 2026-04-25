-- Step 5/7 of the Profile schema overhaul (issue #69).
--
-- Goal: profiles.email duplicates auth.users.email and is never read by the
-- application now that requireAuth pulls the email straight from Supabase.
-- Drop it together with whatever unique index Prisma had attached.
--
-- Postgres auto-drops indexes when the underlying column is dropped, so a
-- single DROP COLUMN is enough.
ALTER TABLE "profiles" DROP COLUMN "email";
