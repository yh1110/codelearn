import "server-only";

import type { Collection, Problem } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError } from "@/lib/errors";
import { logError, logWarn } from "@/lib/logging";
import {
  type CollectionRepository,
  collectionRepository,
  type ProblemRepository,
  problemRepository,
} from "@/repositories";

export async function ensureAuthorOwnsCollection(
  collectionId: string,
  authorId: string,
  repository: CollectionRepository = collectionRepository,
): Promise<Collection> {
  try {
    const collection = await repository.findById(collectionId);
    if (!collection) {
      logWarn("authorGuard.ensureAuthorOwnsCollection.notFound", { collectionId });
      throw new NotFoundError(`Collection not found: ${collectionId}`);
    }
    if (collection.authorId !== authorId) {
      logWarn("authorGuard.ensureAuthorOwnsCollection.forbidden", { collectionId, authorId });
      throw new ForbiddenError(`Not the author of collection: ${collectionId}`);
    }
    return collection;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) throw error;
    logError("authorGuard.ensureAuthorOwnsCollection.error", { collectionId, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function ensureAuthorOwnsProblem(
  problemId: string,
  authorId: string,
  problemRepo: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem> {
  try {
    const problem = await problemRepo.findById(problemId);
    if (!problem) {
      logWarn("authorGuard.ensureAuthorOwnsProblem.notFound", { problemId });
      throw new NotFoundError(`Problem not found: ${problemId}`);
    }
    // ensureAuthorOwnsCollection already logs its own NotFoundError /
    // ForbiddenError warnings; rethrow as-is here to avoid duplicate log lines.
    await ensureAuthorOwnsCollection(problem.collectionId, authorId, collectionRepo);
    return problem;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) throw error;
    logError("authorGuard.ensureAuthorOwnsProblem.error", { problemId, authorId }, error);
    throw handleUnknownError(error);
  }
}
