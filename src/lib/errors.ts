import "server-only";

export class ValidationError extends Error {
  readonly name = "ValidationError";
}

export class NotFoundError extends Error {
  readonly name = "NotFoundError";
}

export class UnauthorizedError extends Error {
  readonly name = "UnauthorizedError";
}

export class ForbiddenError extends Error {
  readonly name = "ForbiddenError";
}

export function handleUnknownError(error: unknown): Error {
  if (error instanceof ValidationError) return error;
  if (error instanceof NotFoundError) return error;
  if (error instanceof UnauthorizedError) return error;
  if (error instanceof ForbiddenError) return error;
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown error");
}
