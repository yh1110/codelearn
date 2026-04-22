import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { type ProgressRepository, progressRepository } from "@/repositories";

export async function completeLesson(
  params: { userId: string; lessonId: string },
  repository: ProgressRepository = progressRepository,
): Promise<{ userId: string; lessonId: string }> {
  try {
    const record = await repository.upsertCompleted(params.userId, params.lessonId);
    return { userId: record.userId, lessonId: record.lessonId };
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function getCompletedLessonIdsByUser(
  userId: string,
  lessonIds?: string[],
  repository: ProgressRepository = progressRepository,
): Promise<string[]> {
  try {
    return await repository.findCompletedLessonIdsByUser(userId, lessonIds);
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function isLessonCompleted(
  userId: string,
  lessonId: string,
  repository: ProgressRepository = progressRepository,
): Promise<boolean> {
  try {
    return await repository.isLessonCompleted(userId, lessonId);
  } catch (error) {
    throw handleUnknownError(error);
  }
}
