import "server-only";

export class ValidationError extends Error {
  readonly name = "ValidationError";
  readonly httpStatus = 400;
}

export class UnauthorizedError extends Error {
  readonly name = "UnauthorizedError";
  readonly httpStatus = 401;
}

export class ForbiddenError extends Error {
  readonly name = "ForbiddenError";
  readonly httpStatus = 403;
}

export class NotFoundError extends Error {
  readonly name = "NotFoundError";
  readonly httpStatus = 404;
}

export type AppError = ValidationError | UnauthorizedError | ForbiddenError | NotFoundError;

export function isKnownAppError(error: unknown): error is AppError {
  return (
    error instanceof ValidationError ||
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError
  );
}

export function handleUnknownError(error: unknown): Error {
  if (isKnownAppError(error)) return error;
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown error");
}
