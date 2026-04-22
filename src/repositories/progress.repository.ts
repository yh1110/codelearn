import "server-only";

import type { Progress } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class ProgressRepository extends BaseRepository {
  async upsertCompleted(userId: string, lessonId: string): Promise<Progress> {
    return this.client.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });
  }

  async findCompletedLessonIdsByUser(userId: string, lessonIds?: string[]): Promise<string[]> {
    const rows = await this.client.progress.findMany({
      where: {
        userId,
        ...(lessonIds ? { lessonId: { in: lessonIds } } : {}),
      },
      select: { lessonId: true },
    });
    return rows.map((r) => r.lessonId);
  }

  async isLessonCompleted(userId: string, lessonId: string): Promise<boolean> {
    const row = await this.client.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { id: true },
    });
    return row !== null;
  }
}
