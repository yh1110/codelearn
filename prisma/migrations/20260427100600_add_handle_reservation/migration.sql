-- Step 7/7 of the Profile schema overhaul (issue #69).
--
-- Goal: introduce handle_reservations so that when a user renames their
-- handle, the old value is parked for 90 days before anyone else can claim
-- it. This closes the time-axis URL-collision discussed in the issue: a
-- previously-shared /courses/{old-handle}/... cannot suddenly resolve to a
-- different person.
CREATE TABLE "handle_reservations" (
    "handle"      TEXT          NOT NULL,
    "released_at" TIMESTAMP(3)  NOT NULL,
    "created_at"  TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handle_reservations_pkey" PRIMARY KEY ("handle")
);

CREATE INDEX "handle_reservations_released_at_idx" ON "handle_reservations"("released_at");
