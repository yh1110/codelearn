import "server-only";

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { requireAuth } from "@/lib/auth";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("[safe-action] server error:", error);
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof UnauthorizedError
    ) {
      return error.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  const session = await requireAuth();
  return next({ ctx: { userId: session.userId, session } });
});
