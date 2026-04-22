import "server-only";

import type { Course, Lesson, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CourseWithLessons = Prisma.CourseGetPayload<{
  include: { lessons: true };
}>;

export type CourseWithLessonIds = Course & { lessons: Pick<Lesson, "id">[] };

export class CourseRepository extends BaseRepository {
  async findAllWithLessonIds(): Promise<CourseWithLessonIds[]> {
    return this.client.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async findBySlugWithLessons(slug: string): Promise<CourseWithLessons | null> {
    return this.client.course.findUnique({
      where: { slug },
      include: { lessons: { orderBy: { order: "asc" } } },
    });
  }
}
