-- Step 1/4 of the schema split (issue #71).
--
-- Adds the UGC-side container tables (collections, problems) plus the
-- per-target bookmark / progress tables that hang off them. Existing tables
-- (Course, Lesson, bookmarks, progress) are NOT touched here — that comes in
-- the later migrations once the new tables are populated and the bookmarks
-- split has run.

-- CreateTable
CREATE TABLE "collections" (
    "id"           TEXT NOT NULL,
    "author_id"    TEXT NOT NULL,
    "slug"         TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "description"  TEXT NOT NULL,
    "order"        INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "collections_author_id_slug_key" ON "collections"("author_id", "slug");
CREATE INDEX "collections_author_id_idx" ON "collections"("author_id");
CREATE INDEX "collections_is_published_idx" ON "collections"("is_published");

ALTER TABLE "collections"
    ADD CONSTRAINT "collections_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "problems" (
    "id"              TEXT NOT NULL,
    "collection_id"   TEXT NOT NULL,
    "slug"            TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "content_md"      TEXT NOT NULL,
    "starter_code"    TEXT NOT NULL,
    "expected_output" TEXT,
    "order"           INTEGER NOT NULL DEFAULT 0,
    "is_published"    BOOLEAN NOT NULL DEFAULT false,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "problems_collection_id_slug_key" ON "problems"("collection_id", "slug");
CREATE INDEX "problems_collection_id_is_published_idx" ON "problems"("collection_id", "is_published");

ALTER TABLE "problems"
    ADD CONSTRAINT "problems_collection_id_fkey"
    FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "bookmark_collections" (
    "id"            TEXT NOT NULL,
    "user_id"       TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_collections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmark_collections_user_id_collection_id_key" ON "bookmark_collections"("user_id", "collection_id");
CREATE INDEX "bookmark_collections_user_id_idx" ON "bookmark_collections"("user_id");

ALTER TABLE "bookmark_collections"
    ADD CONSTRAINT "bookmark_collections_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmark_collections"
    ADD CONSTRAINT "bookmark_collections_collection_id_fkey"
    FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "bookmark_problems" (
    "id"         TEXT NOT NULL,
    "user_id"    TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmark_problems_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bookmark_problems_user_id_problem_id_key" ON "bookmark_problems"("user_id", "problem_id");
CREATE INDEX "bookmark_problems_user_id_idx" ON "bookmark_problems"("user_id");

ALTER TABLE "bookmark_problems"
    ADD CONSTRAINT "bookmark_problems_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookmark_problems"
    ADD CONSTRAINT "bookmark_problems_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "problem_progress" (
    "id"           TEXT NOT NULL,
    "user_id"      TEXT NOT NULL,
    "problem_id"   TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "problem_progress_user_id_problem_id_key" ON "problem_progress"("user_id", "problem_id");
CREATE INDEX "problem_progress_user_id_idx" ON "problem_progress"("user_id");

ALTER TABLE "problem_progress"
    ADD CONSTRAINT "problem_progress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "problem_progress"
    ADD CONSTRAINT "problem_progress_problem_id_fkey"
    FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
