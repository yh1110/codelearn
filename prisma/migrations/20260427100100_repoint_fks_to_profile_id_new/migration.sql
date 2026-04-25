-- Step 2/7 of the Profile schema overhaul (issue #69).
--
-- Goal: every table that today references profiles.id (UUID) gets a parallel
-- TEXT column pointing at profiles.id_new, with proper FK constraints. The
-- legacy UUID columns are kept around (without their FK constraints) until
-- step 4, so a half-applied migration can still be diagnosed with a SELECT.
--
-- Order of operations per table:
--   1. add *_id_new TEXT (nullable)
--   2. UPDATE … FROM profiles to populate it via the legacy id
--   3. SET NOT NULL where the legacy column was NOT NULL
--   4. drop the legacy FK constraint and add the new one targeting id_new
-- Indexes on the new column are created here so the downstream rename step
-- (step 4) only has to swap names, not rebuild btree structures.
--
-- Course.author_id is nullable (official courses), so we skip the NOT NULL
-- step for it.

-- ---- Course ----------------------------------------------------------------
ALTER TABLE "Course" ADD COLUMN "author_id_new" TEXT;

UPDATE "Course" c
   SET "author_id_new" = p."id_new"
  FROM "profiles" p
 WHERE c."author_id" = p."id"
   AND c."author_id_new" IS NULL;

ALTER TABLE "Course" DROP CONSTRAINT "Course_author_id_fkey";
ALTER TABLE "Course"
  ADD CONSTRAINT "Course_author_id_new_fkey"
  FOREIGN KEY ("author_id_new") REFERENCES "profiles"("id_new")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Course_author_id_new_slug_key" ON "Course"("author_id_new", "slug");
CREATE INDEX        "Course_author_id_new_idx"      ON "Course"("author_id_new");

-- ---- Bookmark --------------------------------------------------------------
ALTER TABLE "bookmarks" ADD COLUMN "user_id_new" TEXT;

UPDATE "bookmarks" b
   SET "user_id_new" = p."id_new"
  FROM "profiles" p
 WHERE b."user_id" = p."id"
   AND b."user_id_new" IS NULL;

ALTER TABLE "bookmarks" ALTER COLUMN "user_id_new" SET NOT NULL;
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_user_id_fkey";
ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_user_id_new_fkey"
  FOREIGN KEY ("user_id_new") REFERENCES "profiles"("id_new")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "bookmarks_user_id_new_course_id_key" ON "bookmarks"("user_id_new", "course_id");
CREATE UNIQUE INDEX "bookmarks_user_id_new_lesson_id_key" ON "bookmarks"("user_id_new", "lesson_id");
CREATE INDEX        "bookmarks_user_id_new_idx"           ON "bookmarks"("user_id_new");

-- ---- Notification ----------------------------------------------------------
ALTER TABLE "notifications" ADD COLUMN "recipient_id_new" TEXT;

UPDATE "notifications" n
   SET "recipient_id_new" = p."id_new"
  FROM "profiles" p
 WHERE n."recipient_id" = p."id"
   AND n."recipient_id_new" IS NULL;

ALTER TABLE "notifications" ALTER COLUMN "recipient_id_new" SET NOT NULL;
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_id_fkey";
ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_recipient_id_new_fkey"
  FOREIGN KEY ("recipient_id_new") REFERENCES "profiles"("id_new")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "notifications_recipient_id_new_created_at_idx" ON "notifications"("recipient_id_new", "created_at");
CREATE INDEX "notifications_recipient_id_new_read_at_idx"    ON "notifications"("recipient_id_new", "read_at");

-- ---- Progress --------------------------------------------------------------
ALTER TABLE "progress" ADD COLUMN "user_id_new" TEXT;

UPDATE "progress" pr
   SET "user_id_new" = p."id_new"
  FROM "profiles" p
 WHERE pr."user_id" = p."id"
   AND pr."user_id_new" IS NULL;

ALTER TABLE "progress" ALTER COLUMN "user_id_new" SET NOT NULL;
ALTER TABLE "progress" DROP CONSTRAINT "progress_user_id_fkey";
ALTER TABLE "progress"
  ADD CONSTRAINT "progress_user_id_new_fkey"
  FOREIGN KEY ("user_id_new") REFERENCES "profiles"("id_new")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "progress_user_id_new_lessonId_key" ON "progress"("user_id_new", "lessonId");
