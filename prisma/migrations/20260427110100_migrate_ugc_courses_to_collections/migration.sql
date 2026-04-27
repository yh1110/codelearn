-- Step 2/4 of the schema split (issue #71).
--
-- Copies UGC content out of the legacy Course / Lesson / bookmarks / progress
-- tables into the new collections / problems / bookmark_collections /
-- bookmark_problems / problem_progress tables.
--
-- IDs are preserved: a UGC Course row becomes a Collection row with the same
-- cuid, and so on for Lessons → Problems. This keeps the data round-trippable
-- and lets the data migration be re-run safely (the ON CONFLICT DO NOTHING
-- guards make every INSERT idempotent).

INSERT INTO "collections" (
    "id",
    "author_id",
    "slug",
    "title",
    "description",
    "order",
    "is_published",
    "created_at",
    "updated_at"
)
SELECT
    "id",
    "author_id",
    "slug",
    "title",
    "description",
    "order",
    "is_published",
    "createdAt",
    "updated_at"
FROM "Course"
WHERE "provider_type" = 'COMMUNITY'
  AND "author_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "problems" (
    "id",
    "collection_id",
    "slug",
    "title",
    "content_md",
    "starter_code",
    "expected_output",
    "order",
    "is_published",
    "created_at",
    "updated_at"
)
SELECT
    l."id",
    l."courseId",
    l."slug",
    l."title",
    l."contentMd",
    l."starterCode",
    l."expectedOutput",
    l."order",
    l."is_published",
    l."createdAt",
    l."updated_at"
FROM "Lesson" l
JOIN "Course" c ON c."id" = l."courseId"
WHERE c."provider_type" = 'COMMUNITY'
  AND c."author_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "bookmark_collections" (
    "id",
    "user_id",
    "collection_id",
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
  AND c."provider_type" = 'COMMUNITY'
  AND c."author_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "bookmark_problems" (
    "id",
    "user_id",
    "problem_id",
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
  AND c."provider_type" = 'COMMUNITY'
  AND c."author_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "problem_progress" (
    "id",
    "user_id",
    "problem_id",
    "completed_at"
)
SELECT
    p."id",
    p."user_id",
    p."lessonId",
    p."completedAt"
FROM "progress" p
JOIN "Lesson" l ON l."id" = p."lessonId"
JOIN "Course" c ON c."id" = l."courseId"
WHERE c."provider_type" = 'COMMUNITY'
  AND c."author_id" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;
