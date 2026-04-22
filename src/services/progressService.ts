import "server-only";

import { type ProgressRepository, progressRepository } from "@/repositories";

export async function completeLesson(
  params: { userId: string; lessonId: string },
  repository: ProgressRepository = progressRepository,
): Promise<{ userId: string; lessonId: string }> {
  const { userId, lessonId } = params;
  const record = await repository.upsertCompleted(userId, lessonId);
  return { userId: record.userId, lessonId: record.lessonId };
}
