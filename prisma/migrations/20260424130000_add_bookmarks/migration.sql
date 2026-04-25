-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" TEXT,
    "lesson_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_course_id_key" ON "bookmarks"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_lesson_id_key" ON "bookmarks"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHECK constraint: exactly one of course_id / lesson_id must be non-null.
-- Prisma schema cannot express this; enforced at the DB level so bad rows
-- cannot be inserted even if an application bug slips through.
ALTER TABLE "bookmarks"
    ADD CONSTRAINT "bookmarks_target_xor"
    CHECK (("course_id" IS NULL) <> ("lesson_id" IS NULL));
