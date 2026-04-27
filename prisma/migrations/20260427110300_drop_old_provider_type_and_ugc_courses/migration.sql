-- Step 4/4 of the schema split (issue #71).
--
-- Removes the legacy UGC plumbing now that all UGC content has been migrated
-- to collections / problems and bookmarks have been redistributed.
--
-- Order of operations:
--   1. Delete UGC course rows (cascades to UGC lessons + remaining UGC
--      bookmarks; UGC progress already moved to problem_progress in step 2,
--      and the cascade from Lesson handles whatever stragglers remain).
--   2. Drop the legacy bookmarks table (rows already redistributed).
--   3. Drop the Course.author_id FK + column (Course is now official-only).
--   4. Drop the Course.provider_type column + enum (no longer needed).
--   5. Re-index Course.slug as a global unique (was scoped to author).

DELETE FROM "Course" WHERE "provider_type" = 'COMMUNITY';

DROP TABLE "bookmarks";

ALTER TABLE "Course" DROP CONSTRAINT IF EXISTS "Course_author_id_fkey";
DROP INDEX IF EXISTS "Course_author_id_idx";
DROP INDEX IF EXISTS "Course_author_id_slug_key";
ALTER TABLE "Course" DROP COLUMN "author_id";

DROP INDEX IF EXISTS "Course_provider_type_idx";
ALTER TABLE "Course" DROP COLUMN "provider_type";
DROP TYPE "CourseProviderType";

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
