-- Slug used to be globally unique; from now on URLs are scoped to an author
-- handle (/courses/{handle}/{slug}), so uniqueness moves to (author_id, slug).
-- Postgres treats NULL author_id as distinct, so multiple official courses
-- (author_id IS NULL) can technically share a slug — that's acceptable since
-- official courses are addressed via the reserved /courses/official/{slug}
-- path and seeded slugs are curated.
DROP INDEX "Course_slug_key";

CREATE UNIQUE INDEX "Course_author_id_slug_key" ON "Course"("author_id", "slug");
