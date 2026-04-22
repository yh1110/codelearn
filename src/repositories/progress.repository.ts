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

  async findLessonIdsByUser(userId: string): Promise<string[]> {
    const rows = await this.client.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });
    return rows.map((r) => r.lessonId);
  }
}
