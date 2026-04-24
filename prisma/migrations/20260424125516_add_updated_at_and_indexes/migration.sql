-- AlterTable: add NOT NULL updated_at with a transient DEFAULT so existing
-- rows get backfilled with NOW(), then drop the default so subsequent writes
-- are driven by Prisma's @updatedAt (schema has no @default(now())).
ALTER TABLE "Course" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Course" ALTER COLUMN  "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Lesson" ALTER COLUMN  "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Course_author_id_idx" ON "Course"("author_id");

-- CreateIndex
CREATE INDEX "Course_is_published_idx" ON "Course"("is_published");

-- CreateIndex
CREATE INDEX "Lesson_courseId_is_published_idx" ON "Lesson"("courseId", "is_published");
