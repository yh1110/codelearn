import "server-only";

import type { Profile } from "@prisma/client";
import { handleUnknownError, UnauthorizedError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileRepository } from "@/repositories";

export type Role = "ADMIN" | "USER";

export type Session = {
  userId: string;
  email: string | null;
  role: Role;
  profile: Profile;
};

export async function requireAuth(): Promise<Session> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new UnauthorizedError("supabase is not configured");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new UnauthorizedError("not signed in");

    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const name = typeof meta.name === "string" ? meta.name : null;
    const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;

    // Defense in depth: the auth.users -> profiles trigger syncs on sign-up,
    // but we upsert here too so the Profile always exists for FK targets even
    // if the trigger has not been applied yet.
    const profile = await profileRepository.upsert({
      id: user.id,
      email: user.email ?? null,
      name,
      avatarUrl,
    });

    return {
      userId: user.id,
      email: user.email ?? null,
      role: "USER",
      profile,
    };
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function requireRole(_role: Role): Promise<Session> {
  // Role model is not introduced yet; every authenticated user is treated as
  // "USER". Revisit once an explicit role column lands on Profile.
  return requireAuth();
}
