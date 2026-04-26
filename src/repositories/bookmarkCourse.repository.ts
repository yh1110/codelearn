import "server-only";

import type { BookmarkCourse, Course } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CourseBookmarkWithCourse = BookmarkCourse & {
  course: Course;
};

export class BookmarkCourseRepository extends BaseRepository {
  async findByUser(userId: string): Promise<CourseBookmarkWithCourse[]> {
    return this.client.bookmarkCourse.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { course: true },
    });
  }

  async find(userId: string, courseId: string): Promise<BookmarkCourse | null> {
    return this.client.bookmarkCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }

  async create(userId: string, courseId: string): Promise<BookmarkCourse> {
    return this.client.bookmarkCourse.create({
      data: { userId, courseId },
    });
  }

  async delete(userId: string, courseId: string): Promise<void> {
    await this.client.bookmarkCourse.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
