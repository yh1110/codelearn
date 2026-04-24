import "server-only";

import type { Course, Lesson, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CourseWithLessons = Prisma.CourseGetPayload<{
  include: { lessons: true };
}>;

export type CourseWithLessonIds = Course & { lessons: Pick<Lesson, "id">[] };

export type CreateCourseInput = {
  slug: string;
  title: string;
  description: string;
  order: number;
  authorId: string;
  isPublished?: boolean;
};

export type UpdateCourseInput = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
};

export class CourseRepository extends BaseRepository {
  async findAllWithLessonIds(): Promise<CourseWithLessonIds[]> {
    return this.client.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findAllPublishedWithLessons(): Promise<CourseWithLessonIds[]> {
    return this.client.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findBySlugWithLessons(slug: string): Promise<CourseWithLessons | null> {
    return this.client.course.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
  }

  async findPublishedBySlugWithPublishedLessons(slug: string): Promise<CourseWithLessons | null> {
    return this.client.course.findFirst({
      where: { slug, isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async findByAuthor(authorId: string): Promise<CourseWithLessonIds[]> {
    return this.client.course.findMany({
      where: { authorId },
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return this.client.course.findUnique({ where: { id } });
  }

  async create(input: CreateCourseInput): Promise<Course> {
    return this.client.course.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        order: input.order,
        authorId: input.authorId,
        isPublished: input.isPublished ?? false,
      },
    });
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course> {
    return this.client.course.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<Course> {
    return this.client.course.delete({ where: { id } });
  }

  async togglePublish(id: string, isPublished: boolean): Promise<Course> {
    return this.client.course.update({
      where: { id },
      data: { isPublished },
    });
  }
}
