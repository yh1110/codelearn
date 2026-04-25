import "server-only";

import type { Profile } from "@prisma/client";
import { handleUnknownError, ValidationError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import { type ProfileRepository, type ProfileUpdateInput, profileRepository } from "@/repositories";

export async function updateProfile(
  userId: string,
  data: ProfileUpdateInput,
  repository: ProfileRepository = profileRepository,
): Promise<Profile> {
  logInfo("profileService.updateProfile.start", { userId });
  try {
    const updated = await repository.update(userId, data);
    logInfo("profileService.updateProfile.success", { userId });
    return updated;
  } catch (error) {
    if (isUniqueConstraintError(error, "username")) {
      logInfo("profileService.updateProfile.duplicateUsername", { userId });
      throw new ValidationError("このユーザー名は既に使われています");
    }
    logError("profileService.updateProfile.error", { userId }, error);
    throw handleUnknownError(error);
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
