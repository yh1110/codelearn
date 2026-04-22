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
