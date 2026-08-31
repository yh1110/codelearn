import "server-only";

import type { LessonExecutor, Problem } from "@prisma/client";
import { Prisma } from "@prisma/client";
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
  executor?: LessonExecutor;
  sandpackTemplate?: string | null;
  starterFiles?: Prisma.InputJsonValue | null;
};

export type UpdateProblemInput = {
  slug?: string;
  title?: string;
  contentMd?: string;
  starterCode?: string;
  expectedOutput?: string | null;
  order?: number;
  executor?: LessonExecutor;
  sandpackTemplate?: string | null;
  starterFiles?: Prisma.InputJsonValue | null;
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
        executor: input.executor ?? "WORKER",
        sandpackTemplate: input.sandpackTemplate ?? null,
        starterFiles: toPrismaJson(input.starterFiles),
      },
    });
  }

  async update(id: string, input: UpdateProblemInput): Promise<Problem> {
    const { starterFiles, ...rest } = input;
    return this.client.problem.update({
      where: { id },
      data: {
        ...rest,
        ...(starterFiles === undefined ? {} : { starterFiles: toPrismaJson(starterFiles) }),
      },
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

// `null` clears the JSON column, `undefined` leaves it untouched, but the
// Prisma JSON types treat `null` specially via `Prisma.DbNull`. This helper
// normalizes the trio so callers can pass plain JSON objects.
function toPrismaJson(
  value: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value;
}
