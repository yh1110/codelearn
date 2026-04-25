-- Step 3/7 of the Profile schema overhaul (issue #69).
--
-- Goal: the legacy auth-shaped profiles.id (UUID) is no longer referenced by
-- any FK (the FKs added in step 2 point at profiles.id_new), so we can drop
-- it and promote id_new to the primary key.
--
-- The unique index profiles_id_new_key created in step 1 is what the new
-- FKs reference. We cannot drop it without taking those FKs with it, so we
-- reuse it as the new PK via `ADD CONSTRAINT … USING INDEX`. Postgres
-- atomically renames the index to profiles_pkey and promotes it to a
-- PRIMARY KEY constraint, leaving the FKs intact.

-- 1. Drop the legacy primary key constraint and its UUID column.
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_pkey";
ALTER TABLE "profiles" DROP COLUMN "id";

-- 2. Rename id_new -> id. The unique index profiles_id_new_key follows the
--    column automatically (it just stores a column oid), so it is unchanged.
ALTER TABLE "profiles" RENAME COLUMN "id_new" TO "id";

-- 3. Promote the existing unique index to the primary key. The constraint
--    name becomes the new index name, which keeps Prisma's expectations
--    (profiles_pkey) and means we do not have to rebuild a btree.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_pkey" PRIMARY KEY USING INDEX "profiles_id_new_key";
