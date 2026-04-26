import "server-only";

import type { Collection } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError, ValidationError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CollectionDetailWithAuthor,
  type CollectionRepository,
  type CollectionWithProblemIds,
  type CollectionWithProblemsAndAuthor,
  collectionRepository,
} from "@/repositories";
import { ensureAuthorOwnsCollection } from "./authorGuard";

export async function getPublishedCollectionsByNewest(
  repository: CollectionRepository = collectionRepository,
): Promise<CollectionWithProblemsAndAuthor[]> {
  logInfo("collectionService.getPublishedCollectionsByNewest.start");
  try {
    const result = await repository.findAllPublishedByNewest();
    logInfo("collectionService.getPublishedCollectionsByNewest.success", { count: result.length });
    return result;
  } catch (error) {
    logError("collectionService.getPublishedCollectionsByNewest.error", undefined, error);
    throw handleUnknownError(error);
  }
}

export async function getCollectionByHandleAndSlug(
  params: { handle: string; slug: string },
  repository: CollectionRepository = collectionRepository,
): Promise<CollectionDetailWithAuthor> {
  const { handle, slug } = params;
  logInfo("collectionService.getCollectionByHandleAndSlug.start", { handle, slug });
  try {
    const collection = await repository.findPublishedByHandleAndSlugWithPublishedProblems({
      handle,
      slug,
    });
    if (!collection) throw new NotFoundError(`Collection not found: ${handle}/${slug}`);
    logInfo("collectionService.getCollectionByHandleAndSlug.success", {
      handle,
      slug,
      problemCount: collection.problems.length,
    });
    return collection;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("collectionService.getCollectionByHandleAndSlug.notFound", { handle, slug });
      throw error;
    }
    logError("collectionService.getCollectionByHandleAndSlug.error", { handle, slug }, error);
    throw handleUnknownError(error);
  }
}

export async function getMyCollections(
  authorId: string,
  repository: CollectionRepository = collectionRepository,
): Promise<CollectionWithProblemIds[]> {
  logInfo("collectionService.getMyCollections.start", { authorId });
  try {
    const result = await repository.findByAuthor(authorId);
    logInfo("collectionService.getMyCollections.success", { authorId, count: result.length });
    return result;
  } catch (error) {
    logError("collectionService.getMyCollections.error", { authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function getMyCollectionById(
  params: { id: string; authorId: string },
  repository: CollectionRepository = collectionRepository,
): Promise<Collection> {
  const { id, authorId } = params;
  logInfo("collectionService.getMyCollectionById.start", { id, authorId });
  try {
    const collection = await ensureAuthorOwnsCollection(id, authorId, repository);
    logInfo("collectionService.getMyCollectionById.success", { id, authorId });
    return collection;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export type CreateCollectionParams = {
  authorId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
};

export async function createCollection(
  params: CreateCollectionParams,
  repository: CollectionRepository = collectionRepository,
): Promise<Collection> {
  const { authorId, slug, title, description, order } = params;
  logInfo("collectionService.createCollection.start", { authorId, slug });
  try {
    const collection = await repository.create({
      authorId,
      slug,
      title,
      description,
      order,
    });
    logInfo("collectionService.createCollection.success", { id: collection.id, authorId });
    return collection;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("collectionService.createCollection.slugConflict", { slug });
      throw new ValidationError(`Collection slug already exists: ${slug}`);
    }
    logError("collectionService.createCollection.error", { authorId, slug }, error);
    throw handleUnknownError(error);
  }
}

export type UpdateCollectionParams = {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
};

export async function updateCollection(
  params: UpdateCollectionParams,
  repository: CollectionRepository = collectionRepository,
): Promise<Collection> {
  const { id, authorId, slug, title, description, order } = params;
  logInfo("collectionService.updateCollection.start", { id, authorId });
  try {
    await ensureAuthorOwnsCollection(id, authorId, repository);
    const collection = await repository.update(id, { slug, title, description, order });
    logInfo("collectionService.updateCollection.success", { id, authorId });
    return collection;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("collectionService.updateCollection.slugConflict", { id, slug });
      throw new ValidationError(`Collection slug already exists: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("collectionService.updateCollection.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("collectionService.updateCollection.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function deleteCollection(
  params: { id: string; authorId: string },
  repository: CollectionRepository = collectionRepository,
): Promise<void> {
  const { id, authorId } = params;
  logInfo("collectionService.deleteCollection.start", { id, authorId });
  try {
    await ensureAuthorOwnsCollection(id, authorId, repository);
    await repository.delete(id);
    logInfo("collectionService.deleteCollection.success", { id, authorId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("collectionService.deleteCollection.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("collectionService.deleteCollection.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function togglePublishCollection(
  params: { id: string; authorId: string; isPublished: boolean },
  repository: CollectionRepository = collectionRepository,
): Promise<Collection> {
  const { id, authorId, isPublished } = params;
  logInfo("collectionService.togglePublishCollection.start", { id, authorId, isPublished });
  try {
    await ensureAuthorOwnsCollection(id, authorId, repository);
    const collection = await repository.togglePublish(id, isPublished);
    logInfo("collectionService.togglePublishCollection.success", { id, authorId, isPublished });
    return collection;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("collectionService.togglePublishCollection.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("collectionService.togglePublishCollection.error", { id, authorId }, error);
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
