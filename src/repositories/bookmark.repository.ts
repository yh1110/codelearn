import "server-only";

import type { Bookmark, Course, Lesson } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type CourseBookmarkWithCourse = Bookmark & {
  course: Course & { author: { handle: string } | null };
};

export type LessonBookmarkWithLesson = Bookmark & {
  lesson: Lesson & {
    course: Pick<Course, "id" | "slug" | "title"> & {
      author: { handle: string } | null;
    };
  };
};

export class BookmarkRepository extends BaseRepository {
  async findByUserId(userId: string): Promise<Bookmark[]> {
    return this.client.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findCourseBookmarksByUser(userId: string): Promise<CourseBookmarkWithCourse[]> {
    const rows = await this.client.bookmark.findMany({
      where: { userId, courseId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: { author: { select: { handle: true } } },
        },
      },
    });
    return rows.filter((r): r is CourseBookmarkWithCourse => r.course !== null);
  }

  async findLessonBookmarksByUser(userId: string): Promise<LessonBookmarkWithLesson[]> {
    const rows = await this.client.bookmark.findMany({
      where: { userId, lessonId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            course: {
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
    return rows.filter((r): r is LessonBookmarkWithLesson => r.lesson !== null);
  }

  async findCourseBookmark(userId: string, courseId: string): Promise<Bookmark | null> {
    return this.client.bookmark.findUnique({
      where: { user_course_bookmark: { userId, courseId } },
    });
  }

  async findLessonBookmark(userId: string, lessonId: string): Promise<Bookmark | null> {
    return this.client.bookmark.findUnique({
      where: { user_lesson_bookmark: { userId, lessonId } },
    });
  }

  async createCourseBookmark(userId: string, courseId: string): Promise<Bookmark> {
    return this.client.bookmark.create({
      data: { userId, courseId },
    });
  }

  async deleteCourseBookmark(userId: string, courseId: string): Promise<void> {
    await this.client.bookmark.delete({
      where: { user_course_bookmark: { userId, courseId } },
    });
  }

  async createLessonBookmark(userId: string, lessonId: string): Promise<Bookmark> {
    return this.client.bookmark.create({
      data: { userId, lessonId },
    });
  }

  async deleteLessonBookmark(userId: string, lessonId: string): Promise<void> {
    await this.client.bookmark.delete({
      where: { user_lesson_bookmark: { userId, lessonId } },
    });
  }
}
