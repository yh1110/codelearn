import "server-only";

import type { Lesson, LessonExecutor } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CreateLessonInput = {
  courseId: string;
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

export type UpdateLessonInput = {
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

export class LessonRepository extends BaseRepository {
  async findByCourse(courseId: string): Promise<Lesson[]> {
    return this.client.lesson.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });
  }

  async findPublishedByCourse(courseId: string): Promise<Lesson[]> {
    return this.client.lesson.findMany({
      where: { courseId, isPublished: true },
      orderBy: { order: "asc" },
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    return this.client.lesson.findUnique({ where: { id } });
  }

  async create(input: CreateLessonInput): Promise<Lesson> {
    return this.client.lesson.create({
      data: {
        courseId: input.courseId,
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

  async update(id: string, input: UpdateLessonInput): Promise<Lesson> {
    const { starterFiles, ...rest } = input;
    return this.client.lesson.update({
      where: { id },
      data: {
        ...rest,
        ...(starterFiles === undefined ? {} : { starterFiles: toPrismaJson(starterFiles) }),
      },
    });
  }

  async delete(id: string): Promise<Lesson> {
    return this.client.lesson.delete({ where: { id } });
  }

  async togglePublish(id: string, isPublished: boolean): Promise<Lesson> {
    return this.client.lesson.update({
      where: { id },
      data: { isPublished },
    });
  }
}

function toPrismaJson(
  value: Prisma.InputJsonValue | null | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (value === null || value === undefined) {
    return Prisma.DbNull;
  }
  return value;
}
