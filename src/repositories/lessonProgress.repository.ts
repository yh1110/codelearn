import "server-only";

import type { LessonProgress } from "@prisma/client";
import { BaseRepository } from "./base.repository";

// Renamed from ProgressRepository (issue #71). The underlying table is still
// `progress` — only the Prisma model name changed to make official-vs-UGC
// progress tracking discoverable.
export class LessonProgressRepository extends BaseRepository {
  async upsertCompleted(userId: string, lessonId: string): Promise<LessonProgress> {
    return this.client.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });
  }

  async findCompletedLessonIdsByUser(userId: string, lessonIds?: string[]): Promise<string[]> {
    const rows = await this.client.lessonProgress.findMany({
      where: {
        userId,
        ...(lessonIds ? { lessonId: { in: lessonIds } } : {}),
      },
      select: { lessonId: true },
    });
    return rows.map((r) => r.lessonId);
  }

  async isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
    const row = await this.client.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { id: true },
    });
    return row !== null;
  }
}
