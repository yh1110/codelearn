-- CreateEnum
CREATE TYPE "CourseProviderType" AS ENUM ('OFFICIAL', 'COMMUNITY');

-- AlterTable: add provider_type column. Default COMMUNITY so new UGC rows
-- are classified correctly without the author having to specify it.
ALTER TABLE "Course" ADD COLUMN     "provider_type" "CourseProviderType" NOT NULL DEFAULT 'COMMUNITY';

-- CreateIndex
CREATE INDEX "Course_provider_type_idx" ON "Course"("provider_type");

-- Backfill: pre-UGC rows (seed content) have no author_id set, so classify
-- them as OFFICIAL. UGC rows created after the app gained an authorId field
-- always have author_id set and keep the COMMUNITY default.
UPDATE "Course" SET "provider_type" = 'OFFICIAL' WHERE "author_id" IS NULL;
