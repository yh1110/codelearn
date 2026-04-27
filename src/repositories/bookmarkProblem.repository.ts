import "server-only";

import type { BookmarkProblem, Collection, Problem } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type ProblemBookmarkWithProblem = BookmarkProblem & {
  problem: Problem & {
    collection: Pick<Collection, "id" | "slug" | "title"> & {
      author: { handle: string };
    };
  };
};

export class BookmarkProblemRepository extends BaseRepository {
  async findByUser(userId: string): Promise<ProblemBookmarkWithProblem[]> {
    return this.client.bookmarkProblem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        problem: {
          include: {
            collection: {
              select: {
                id: true,
                slug: true,
                title: true,
                author: { select: { handle: true } },
              },
            },
          },
        },
      },
    });
  }

  async find(userId: string, problemId: string): Promise<BookmarkProblem | null> {
    return this.client.bookmarkProblem.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
  }

  async create(userId: string, problemId: string): Promise<BookmarkProblem> {
    return this.client.bookmarkProblem.create({
      data: { userId, problemId },
    });
  }

  async delete(userId: string, problemId: string): Promise<void> {
    await this.client.bookmarkProblem.delete({
      where: { userId_problemId: { userId, problemId } },
    });
  }
}
