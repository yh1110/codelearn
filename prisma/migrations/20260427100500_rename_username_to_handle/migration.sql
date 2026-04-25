-- Step 6/7 of the Profile schema overhaul (issue #69).
--
-- Goal: profiles.username has always meant "URL handle". Rename it so the
-- column name matches the concept; a coordinated reservation table is added
-- in step 7 to enforce 90-day cooldowns.
--
-- The old schema declared both `@unique` and `@@index([username])`, which
-- produced two btree indexes on the same column. The new schema only keeps
-- the unique index, so we rename it and drop the redundant plain index.
ALTER TABLE "profiles" RENAME COLUMN "username" TO "handle";
ALTER INDEX  "profiles_username_key" RENAME TO "profiles_handle_key";
DROP INDEX   "profiles_username_idx";
