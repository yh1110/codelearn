import "server-only";

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action] server error:", error);
    return error.message || DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  // TODO(#5): replace with `requireAuth()` once Supabase auth lands.
  // For PoC, userId is fixed to "local-user" and exposed via ctx.
  return next({ ctx: { userId: "local-user" } });
});
