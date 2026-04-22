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
}
