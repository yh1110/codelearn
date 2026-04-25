-- Step 4/7 of the Profile schema overhaul (issue #69).
--
-- Goal: drop the now-unused legacy UUID FK columns on every dependent table
-- and rename the *_id_new columns / indexes / constraints back to their
-- canonical names. After this step the schema looks identical to the legacy
-- one except every FK is TEXT and points at profiles(id) (the cuid).
--
-- Dropping the legacy column also removes any indexes Postgres still has on
-- it, which is why we don't have to drop the legacy unique indexes
-- explicitly — they vanish with the column.

-- ---- Course ----------------------------------------------------------------
ALTER TABLE "Course" DROP COLUMN "author_id";
ALTER TABLE "Course" RENAME COLUMN "author_id_new" TO "author_id";
ALTER INDEX  "Course_author_id_new_slug_key"     RENAME TO "Course_author_id_slug_key";
ALTER INDEX  "Course_author_id_new_idx"          RENAME TO "Course_author_id_idx";
ALTER TABLE  "Course" RENAME CONSTRAINT "Course_author_id_new_fkey" TO "Course_author_id_fkey";

-- ---- Bookmark --------------------------------------------------------------
ALTER TABLE "bookmarks" DROP COLUMN "user_id";
ALTER TABLE "bookmarks" RENAME COLUMN "user_id_new" TO "user_id";
ALTER INDEX  "bookmarks_user_id_new_course_id_key" RENAME TO "bookmarks_user_id_course_id_key";
ALTER INDEX  "bookmarks_user_id_new_lesson_id_key" RENAME TO "bookmarks_user_id_lesson_id_key";
ALTER INDEX  "bookmarks_user_id_new_idx"           RENAME TO "bookmarks_user_id_idx";
ALTER TABLE  "bookmarks" RENAME CONSTRAINT "bookmarks_user_id_new_fkey" TO "bookmarks_user_id_fkey";

-- ---- Notification ----------------------------------------------------------
ALTER TABLE "notifications" DROP COLUMN "recipient_id";
ALTER TABLE "notifications" RENAME COLUMN "recipient_id_new" TO "recipient_id";
ALTER INDEX  "notifications_recipient_id_new_created_at_idx" RENAME TO "notifications_recipient_id_created_at_idx";
ALTER INDEX  "notifications_recipient_id_new_read_at_idx"    RENAME TO "notifications_recipient_id_read_at_idx";
ALTER TABLE  "notifications" RENAME CONSTRAINT "notifications_recipient_id_new_fkey" TO "notifications_recipient_id_fkey";

-- ---- Progress --------------------------------------------------------------
ALTER TABLE "progress" DROP COLUMN "user_id";
ALTER TABLE "progress" RENAME COLUMN "user_id_new" TO "user_id";
ALTER INDEX  "progress_user_id_new_lessonId_key" RENAME TO "progress_user_id_lessonId_key";
ALTER TABLE  "progress" RENAME CONSTRAINT "progress_user_id_new_fkey" TO "progress_user_id_fkey";
