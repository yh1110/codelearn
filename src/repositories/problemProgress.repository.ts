import "server-only";

import type { ProblemProgress } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class ProblemProgressRepository extends BaseRepository {
  async upsertCompleted(userId: string, problemId: string): Promise<ProblemProgress> {
    return this.client.problemProgress.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {},
      create: { userId, problemId },
    });
  }

  async findCompletedProblemIdsByUser(userId: string, problemIds?: string[]): Promise<string[]> {
    const rows = await this.client.problemProgress.findMany({
      where: {
        userId,
        ...(problemIds ? { problemId: { in: problemIds } } : {}),
      },
      select: { problemId: true },
    });
    return rows.map((r) => r.problemId);
  }

  async isProblemCompleted(userId: string, problemId: string): Promise<boolean> {
    const row = await this.client.problemProgress.findUnique({
      where: { userId_problemId: { userId, problemId } },
      select: { id: true },
    });
    return row !== null;
  }
}
