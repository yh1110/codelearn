import "server-only";

import type { Profile } from "@prisma/client";
import { handleUnknownError, ValidationError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import { isReservedHandle } from "@/lib/reservedNames";
import {
  type HandleReservationRepository,
  handleReservationRepository,
  type ProfileRepository,
  type ProfileUpdateInput,
  profileRepository,
} from "@/repositories";

export type UpdateProfileDeps = {
  profile?: ProfileRepository;
  reservation?: HandleReservationRepository;
  now?: () => Date;
};

/**
 * Update a Profile, enforcing the 90-day handle reservation rule.
 *
 * When the handle changes we (1) reject reserved namespaces, (2) reject
 * handles parked by an earlier rename whose cooldown has not elapsed,
 * (3) write the update (the unique constraint catches concurrent races),
 * and (4) park the previous handle so old `/{handle}/...` URLs do not
 * silently start resolving to a different person.
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateInput,
  deps: UpdateProfileDeps = {},
): Promise<Profile> {
  const profileRepo = deps.profile ?? profileRepository;
  const reservationRepo = deps.reservation ?? handleReservationRepository;
  const now = deps.now ?? (() => new Date());

  logInfo("profileService.updateProfile.start", { userId });
  try {
    const current = await profileRepo.findById(userId);
    if (!current) {
      throw new ValidationError("プロフィールが見つかりません");
    }

    const handleChanged = data.handle !== undefined && data.handle !== current.handle;
    if (handleChanged && data.handle) {
      await assertHandleAvailable(data.handle, reservationRepo, now());
    }

    const updated = await profileRepo.update(userId, data);

    if (handleChanged) {
      await reservationRepo.reserve(current.handle, now());
    }

    logInfo("profileService.updateProfile.success", { userId });
    return updated;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    if (isUniqueConstraintError(error, "handle")) {
      logInfo("profileService.updateProfile.duplicateHandle", { userId });
      throw new ValidationError("このハンドルは既に使われています");
    }
    logError("profileService.updateProfile.error", { userId }, error);
    throw handleUnknownError(error);
  }
}

async function assertHandleAvailable(
  handle: string,
  reservationRepo: HandleReservationRepository,
  now: Date,
): Promise<void> {
  if (isReservedHandle(handle)) {
    throw new ValidationError("このハンドルは使用できません");
  }
  const reservation = await reservationRepo.findByHandle(handle);
  if (reservation && reservation.releasedAt > now) {
    throw new ValidationError("このハンドルは現在使用できません (予約期間中)");
  }
}

function isUniqueConstraintError(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  if (!field) return true;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
}
