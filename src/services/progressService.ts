import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import { type ProgressRepository, progressRepository } from "@/repositories";

export async function completeLesson(
  params: { userId: string; lessonId: string },
  repository: ProgressRepository = progressRepository,
): Promise<{ userId: string; lessonId: string }> {
  logInfo("progressService.completeLesson.start", {
    userId: params.userId,
    lessonId: params.lessonId,
  });
  try {
    const record = await repository.upsertCompleted(params.userId, params.lessonId);
    logInfo("progressService.completeLesson.success", {
      userId: record.userId,
      lessonId: record.lessonId,
    });
    return { userId: record.userId, lessonId: record.lessonId };
  } catch (error) {
    logError(
      "progressService.completeLesson.error",
      { userId: params.userId, lessonId: params.lessonId },
      error,
    );
    throw handleUnknownError(error);
  }
}

export async function getCompletedLessonIdsByUser(
  userId: string,
  lessonIds?: string[],
  repository: ProgressRepository = progressRepository,
): Promise<string[]> {
  logInfo("progressService.getCompletedLessonIdsByUser.start", {
    userId,
    lessonIdCount: lessonIds?.length,
  });
  try {
    const result = await repository.findCompletedLessonIdsByUser(userId, lessonIds);
    logInfo("progressService.getCompletedLessonIdsByUser.success", {
      userId,
      completedCount: result.length,
    });
    return result;
  } catch (error) {
    logError(
      "progressService.getCompletedLessonIdsByUser.error",
      { userId, lessonIdCount: lessonIds?.length },
      error,
    );
    throw handleUnknownError(error);
  }
}

export async function isLessonCompleted(
  userId: string,
  lessonId: string,
  repository: ProgressRepository = progressRepository,
): Promise<boolean> {
  logInfo("progressService.isLessonCompleted.start", { userId, lessonId });
  try {
    const result = await repository.isLessonCompleted(userId, lessonId);
    logInfo("progressService.isLessonCompleted.success", { userId, lessonId, completed: result });
    return result;
  } catch (error) {
    logError("progressService.isLessonCompleted.error", { userId, lessonId }, error);
    throw handleUnknownError(error);
  }
}
