import "server-only";

import type { Lesson } from "@prisma/client";
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
};

export type UpdateLessonInput = {
  slug?: string;
  title?: string;
  contentMd?: string;
  starterCode?: string;
  expectedOutput?: string | null;
  order?: number;
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

  async findByIdForCourse(id: string, courseId: string): Promise<Lesson | null> {
    return this.client.lesson.findFirst({ where: { id, courseId } });
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
      },
    });
  }

  async update(id: string, input: UpdateLessonInput): Promise<Lesson> {
    return this.client.lesson.update({
      where: { id },
      data: input,
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
