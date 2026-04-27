import "server-only";

import type { Problem } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CreateProblemInput = {
  collectionId: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  order: number;
  isPublished?: boolean;
};

export type UpdateProblemInput = {
  slug?: string;
  title?: string;
  contentMd?: string;
  starterCode?: string;
  expectedOutput?: string | null;
  order?: number;
};

export class ProblemRepository extends BaseRepository {
  async findByCollection(collectionId: string): Promise<Problem[]> {
    return this.client.problem.findMany({
      where: { collectionId },
      orderBy: { order: "asc" },
    });
  }

  async findPublishedByCollection(collectionId: string): Promise<Problem[]> {
    return this.client.problem.findMany({
      where: { collectionId, isPublished: true },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string): Promise<Problem | null> {
    return this.client.problem.findUnique({ where: { id } });
  }

  async create(input: CreateProblemInput): Promise<Problem> {
    return this.client.problem.create({
      data: {
        collectionId: input.collectionId,
        slug: input.slug,
        title: input.title,
        contentMd: input.contentMd,
        starterCode: input.starterCode,
        expectedOutput: input.expectedOutput,
        order: input.order,
        isPublished: input.isPublished ?? false,
      },
    });
  }

  async update(id: string, input: UpdateProblemInput): Promise<Problem> {
    return this.client.problem.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<Problem> {
    return this.client.problem.delete({ where: { id } });
  }

  async togglePublish(id: string, isPublished: boolean): Promise<Problem> {
    return this.client.problem.update({
      where: { id },
      data: { isPublished },
    });
  }
}
