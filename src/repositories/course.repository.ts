import "server-only";

import type { Course, Lesson } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CourseWithLessonIds = Course & { lessons: Pick<Lesson, "id">[] };

export type CourseWithLessons = CourseWithLessonIds;

export type CourseDetail = Course & {
  lessons: Lesson[];
};

export type CreateCourseInput = {
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type UpdateCourseInput = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
};

// Course is now official-only (issue #71). UGC equivalents live in
// CollectionRepository / ProblemRepository.
export class CourseRepository extends BaseRepository {
  async findAllWithLessonIds(): Promise<CourseWithLessonIds[]> {
    return this.client.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findAllPublishedWithLessons(): Promise<CourseWithLessons[]> {
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

  async findPublishedBySlugWithPublishedLessons(slug: string): Promise<CourseDetail | null> {
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
