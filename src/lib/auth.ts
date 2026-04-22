import "server-only";

import type { Profile } from "@prisma/client";
import { ForbiddenError, handleUnknownError, UnauthorizedError } from "@/lib/errors";
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

    // Happy path: the auth.users -> profiles trigger has already created the
    // row, so a single SELECT is enough. Fall back to UPSERT only when the
    // trigger has not run yet (first-time sign-in before the migration is
    // applied) — avoids a write on every protected request.
    let profile = await profileRepository.findById(user.id);
    if (!profile) {
      const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
      const name = typeof meta.name === "string" ? meta.name : null;
      const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
      profile = await profileRepository.upsert({
        id: user.id,
        email: user.email ?? null,
        name,
        avatarUrl,
      });
    }

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

export async function requireRole(role: Role): Promise<Session> {
  const session = await requireAuth();
  // TODO: Drop this branch once Profile gains an explicit role column. Until
  // then, refuse ADMIN requests loudly instead of silently granting them via
  // requireAuth — that would be a trivial privilege-escalation foot-gun.
  if (role === "ADMIN") {
    throw new ForbiddenError("ADMIN role enforcement is not yet implemented");
  }
  return session;
}
