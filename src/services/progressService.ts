import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import {
  type LessonProgressRepository,
  lessonProgressRepository,
  type ProblemProgressRepository,
  problemProgressRepository,
} from "@/repositories";

export async function completeLesson(
  params: { userId: string; lessonId: string },
  repository: LessonProgressRepository = lessonProgressRepository,
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
  repository: LessonProgressRepository = lessonProgressRepository,
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
  repository: LessonProgressRepository = lessonProgressRepository,
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

export async function completeProblem(
  params: { userId: string; problemId: string },
  repository: ProblemProgressRepository = problemProgressRepository,
): Promise<{ userId: string; problemId: string }> {
  logInfo("progressService.completeProblem.start", {
    userId: params.userId,
    problemId: params.problemId,
  });
  try {
    const record = await repository.upsertCompleted(params.userId, params.problemId);
    logInfo("progressService.completeProblem.success", {
      userId: record.userId,
      problemId: record.problemId,
    });
    return { userId: record.userId, problemId: record.problemId };
  } catch (error) {
    logError(
      "progressService.completeProblem.error",
      { userId: params.userId, problemId: params.problemId },
      error,
    );
    throw handleUnknownError(error);
  }
}

export async function getCompletedProblemIdsByUser(
  userId: string,
  problemIds?: string[],
  repository: ProblemProgressRepository = problemProgressRepository,
): Promise<string[]> {
  logInfo("progressService.getCompletedProblemIdsByUser.start", {
    userId,
    problemIdCount: problemIds?.length,
  });
  try {
    const result = await repository.findCompletedProblemIdsByUser(userId, problemIds);
    logInfo("progressService.getCompletedProblemIdsByUser.success", {
      userId,
      completedCount: result.length,
    });
    return result;
  } catch (error) {
    logError(
      "progressService.getCompletedProblemIdsByUser.error",
      { userId, problemIdCount: problemIds?.length },
      error,
    );
    throw handleUnknownError(error);
  }
}

export async function isProblemCompleted(
  userId: string,
  problemId: string,
  repository: ProblemProgressRepository = problemProgressRepository,
): Promise<boolean> {
  logInfo("progressService.isProblemCompleted.start", { userId, problemId });
  try {
    const result = await repository.isProblemCompleted(userId, problemId);
    logInfo("progressService.isProblemCompleted.success", { userId, problemId, completed: result });
    return result;
  } catch (error) {
    logError("progressService.isProblemCompleted.error", { userId, problemId }, error);
    throw handleUnknownError(error);
  }
}
