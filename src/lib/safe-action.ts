import "server-only";

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { NotFoundError, ValidationError } from "@/lib/errors";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action] server error:", error);
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return error.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  // TODO(#5): replace with `requireAuth()` once Supabase auth lands.
  // For PoC, userId is fixed to "local-user" and exposed via ctx.
  return next({ ctx: { userId: "local-user" } });
});
