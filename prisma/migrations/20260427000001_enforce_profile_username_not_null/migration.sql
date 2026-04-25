-- AlterTable: now that all rows are backfilled, enforce NOT NULL so URLs of
-- the form /courses/{handle}/{slug} can rely on every profile having a handle.
ALTER TABLE "profiles" ALTER COLUMN "username" SET NOT NULL;
