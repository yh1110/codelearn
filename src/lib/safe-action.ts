import "server-only";

import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { logError } from "@/lib/logging";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    logError("safeAction.handleServerError", undefined, error);
    // Let auth-class errors propagate so Next.js routes them to error.tsx /
    // the middleware redirect flow — they are not normal action failures.
    if (error instanceof UnauthorizedError) throw error;
    if (error instanceof ForbiddenError) throw error;
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      return error.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  const session = await requireAuth();
  return next({ ctx: { userId: session.userId, session } });
});
