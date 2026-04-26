-- Step 3/4 of the schema split (issue #71).
--
-- Creates the per-target bookmark tables for OFFICIAL Course / Lesson and
-- copies the matching rows out of the polymorphic `bookmarks` table. UGC
-- bookmarks were already migrated to bookmark_collections / bookmark_problems
-- in step 2, so we filter to provider_type = 'OFFICIAL' here to avoid
-- double-inserting.
--
-- The legacy `bookmarks` table itself is dropped in step 4 once all rows
-- have been redistributed.

-- CreateTable
CREATE TABLE "bookmark_courses" (
    "id"         TEXT NOT NULL,
    "user_id"    TEXT NOT NULL,
    "course_id"  TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmark_courses_user_id_course_id_key" ON "bookmark_courses"("user_id", "course_id");
CREATE INDEX "bookmark_courses_user_id_idx" ON "bookmark_courses"("user_id");

ALTER TABLE "bookmark_courses"
    ADD CONSTRAINT "bookmark_courses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmark_courses"
    ADD CONSTRAINT "bookmark_courses_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "bookmark_lessons" (
    "id"         TEXT NOT NULL,
    "user_id"    TEXT NOT NULL,
    "lesson_id"  TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_lessons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmark_lessons_user_id_lesson_id_key" ON "bookmark_lessons"("user_id", "lesson_id");
CREATE INDEX "bookmark_lessons_user_id_idx" ON "bookmark_lessons"("user_id");

ALTER TABLE "bookmark_lessons"
    ADD CONSTRAINT "bookmark_lessons_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmark_lessons"
    ADD CONSTRAINT "bookmark_lessons_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: official-side rows out of the polymorphic table.
INSERT INTO "bookmark_courses" (
    "id",
    "user_id",
    "course_id",
    "created_at"
)
SELECT
    b."id",
    b."user_id",
    b."course_id",
    b."created_at"
FROM "bookmarks" b
JOIN "Course" c ON c."id" = b."course_id"
WHERE b."course_id" IS NOT NULL
  AND c."provider_type" = 'OFFICIAL'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "bookmark_lessons" (
    "id",
    "user_id",
    "lesson_id",
    "created_at"
)
SELECT
    b."id",
    b."user_id",
    b."lesson_id",
    b."created_at"
FROM "bookmarks" b
JOIN "Lesson" l ON l."id" = b."lesson_id"
JOIN "Course" c ON c."id" = l."courseId"
WHERE b."lesson_id" IS NOT NULL
  AND c."provider_type" = 'OFFICIAL'
ON CONFLICT ("id") DO NOTHING;
