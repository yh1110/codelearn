import "server-only";

import type { BookmarkLesson, Course, Lesson } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export type LessonBookmarkWithLesson = BookmarkLesson & {
  lesson: Lesson & {
    course: Pick<Course, "id" | "slug" | "title">;
  };
};

export class BookmarkLessonRepository extends BaseRepository {
  async findByUser(userId: string): Promise<LessonBookmarkWithLesson[]> {
    return this.client.bookmarkLesson.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            course: { select: { id: true, slug: true, title: true } },
          },
        },
      },
    });
  }

  async find(userId: string, lessonId: string): Promise<BookmarkLesson | null> {
    return this.client.bookmarkLesson.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }

  async create(userId: string, lessonId: string): Promise<BookmarkLesson> {
    return this.client.bookmarkLesson.create({
      data: { userId, lessonId },
    });
  }

  async delete(userId: string, lessonId: string): Promise<void> {
    await this.client.bookmarkLesson.delete({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }
}
