import "server-only";

import type { Problem } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError, ValidationError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CollectionRepository,
  collectionRepository,
  type ProblemRepository,
  problemRepository,
} from "@/repositories";
import { ensureAuthorOwnsCollection, ensureAuthorOwnsProblem } from "./authorGuard";

export async function getProblemsByCollection(
  params: { collectionId: string; authorId: string },
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem[]> {
  const { collectionId, authorId } = params;
  logInfo("problemService.getProblemsByCollection.start", { collectionId, authorId });
  try {
    await ensureAuthorOwnsCollection(collectionId, authorId, collectionRepo);
    const problems = await repository.findByCollection(collectionId);
    logInfo("problemService.getProblemsByCollection.success", {
      collectionId,
      authorId,
      count: problems.length,
    });
    return problems;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function getMyProblemById(
  params: { id: string; authorId: string },
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem> {
  const { id, authorId } = params;
  logInfo("problemService.getMyProblemById.start", { id, authorId });
  try {
    const problem = await ensureAuthorOwnsProblem(id, authorId, repository, collectionRepo);
    logInfo("problemService.getMyProblemById.success", { id, authorId });
    return problem;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export type CreateProblemParams = {
  collectionId: string;
  authorId: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  order: number;
};

export async function createProblem(
  params: CreateProblemParams,
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem> {
  const { collectionId, authorId, slug, title, contentMd, starterCode, expectedOutput, order } =
    params;
  logInfo("problemService.createProblem.start", { collectionId, authorId, slug });
  try {
    await ensureAuthorOwnsCollection(collectionId, authorId, collectionRepo);
    const problem = await repository.create({
      collectionId,
      slug,
      title,
      contentMd,
      starterCode,
      expectedOutput,
      order,
    });
    logInfo("problemService.createProblem.success", { id: problem.id, collectionId });
    return problem;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("problemService.createProblem.slugConflict", { collectionId, slug });
      throw new ValidationError(`Problem slug already exists in this collection: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("problemService.createProblem.notFound", { collectionId });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("problemService.createProblem.error", { collectionId, authorId, slug }, error);
    throw handleUnknownError(error);
  }
}

export type UpdateProblemParams = {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  order: number;
};

export async function updateProblem(
  params: UpdateProblemParams,
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem> {
  const { id, authorId, slug, title, contentMd, starterCode, expectedOutput, order } = params;
  logInfo("problemService.updateProblem.start", { id, authorId });
  try {
    await ensureAuthorOwnsProblem(id, authorId, repository, collectionRepo);
    const problem = await repository.update(id, {
      slug,
      title,
      contentMd,
      starterCode,
      expectedOutput,
      order,
    });
    logInfo("problemService.updateProblem.success", { id, authorId });
    return problem;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("problemService.updateProblem.slugConflict", { id, slug });
      throw new ValidationError(`Problem slug already exists in this collection: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("problemService.updateProblem.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("problemService.updateProblem.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function deleteProblem(
  params: { id: string; authorId: string },
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<void> {
  const { id, authorId } = params;
  logInfo("problemService.deleteProblem.start", { id, authorId });
  try {
    await ensureAuthorOwnsProblem(id, authorId, repository, collectionRepo);
    await repository.delete(id);
    logInfo("problemService.deleteProblem.success", { id, authorId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("problemService.deleteProblem.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("problemService.deleteProblem.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function togglePublishProblem(
  params: { id: string; authorId: string; isPublished: boolean },
  repository: ProblemRepository = problemRepository,
  collectionRepo: CollectionRepository = collectionRepository,
): Promise<Problem> {
  const { id, authorId, isPublished } = params;
  logInfo("problemService.togglePublishProblem.start", { id, authorId, isPublished });
  try {
    await ensureAuthorOwnsProblem(id, authorId, repository, collectionRepo);
    const problem = await repository.togglePublish(id, isPublished);
    logInfo("problemService.togglePublishProblem.success", { id, authorId, isPublished });
    return problem;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("problemService.togglePublishProblem.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("problemService.togglePublishProblem.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

function isUniqueConstraintError(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  if (!field) return true;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
}
