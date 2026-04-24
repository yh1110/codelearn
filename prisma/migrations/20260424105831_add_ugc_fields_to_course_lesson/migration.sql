-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "author_id" UUID,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: pre-UGC rows are treated as published so the learner view is not
-- emptied out when this migration is deployed to production. New rows still
-- default to false (UGC drafts stay private until the author publishes).
UPDATE "Course" SET "is_published" = true;
UPDATE "Lesson" SET "is_published" = true;
