import "server-only";

export type Role = "ADMIN" | "USER";

export type Session = {
  userId: string;
  email: string;
  role: Role;
};

/**
 * Returns the current authenticated session. Throws `UnauthorizedError` when
 * no session is present.
 *
 * Stub: full implementation lands in issue #5 (Auth). Today this always throws
 * so callers fail loudly if they reach the check before #5 ships.
 */
export async function requireAuth(): Promise<Session> {
  throw new Error("requireAuth: not implemented (see #5)");
}

/**
 * Returns the current session if its role matches `role`. Throws
 * `ForbiddenError` on role mismatch and `UnauthorizedError` when unauthenticated.
 *
 * Stub: full implementation lands in issue #5.
 */
export async function requireRole(_role: Role): Promise<Session> {
  throw new Error("requireRole: not implemented (see #5)");
}
