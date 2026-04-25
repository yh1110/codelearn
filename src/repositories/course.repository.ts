import "server-only";

import type { Course, Lesson } from "@prisma/client";
import { OFFICIAL_HANDLE } from "@/lib/routes";
import { BaseRepository } from "./base.repository";

export type CourseWithLessonIds = Course & { lessons: Pick<Lesson, "id">[] };

export type CourseAuthor = {
  id: string;
  name: string | null;
  handle: string;
  avatarUrl: string | null;
};

const COURSE_AUTHOR_SELECT = {
  id: true,
  name: true,
  handle: true,
  avatarUrl: true,
} as const;

export type CourseWithLessonsAndAuthor = CourseWithLessonIds & {
  author: CourseAuthor | null;
};

export type CourseDetailWithAuthor = Course & {
  lessons: Lesson[];
  author: CourseAuthor | null;
};

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

  async findAllPublishedWithLessons(): Promise<CourseWithLessonsAndAuthor[]> {
    return this.client.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
        author: { select: COURSE_AUTHOR_SELECT },
      },
    });
  }

  async findAllPublishedByNewest(): Promise<CourseWithLessonsAndAuthor[]> {
    return this.client.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
        author: { select: COURSE_AUTHOR_SELECT },
      },
    });
  }

  async findOfficialPublished(): Promise<CourseWithLessonsAndAuthor[]> {
    return this.client.course.findMany({
      where: { isPublished: true, providerType: "OFFICIAL" },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
        author: { select: COURSE_AUTHOR_SELECT },
      },
    });
  }

  async findCommunityPublishedByNewest(): Promise<CourseWithLessonsAndAuthor[]> {
    return this.client.course.findMany({
      where: { isPublished: true, providerType: "COMMUNITY" },
      orderBy: { createdAt: "desc" },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
        author: { select: COURSE_AUTHOR_SELECT },
      },
    });
  }

  /**
   * Resolve a course addressed by `/courses/{handle}/{slug}`.
   * - `handle === OFFICIAL_HANDLE` matches courses with `authorId IS NULL`.
   * - Any other handle is looked up against `Profile.handle`; an unknown
   *   handle returns `null` (the page should `notFound()`).
   *
   * Two queries on the UGC path is fine — both columns are indexed
   * (`profiles.handle` unique + `Course(authorId, slug)` unique).
   */
  async findPublishedByHandleAndSlugWithPublishedLessons(params: {
    handle: string;
    slug: string;
  }): Promise<CourseDetailWithAuthor | null> {
    const { handle, slug } = params;

    let authorId: string | null;
    if (handle === OFFICIAL_HANDLE) {
      authorId = null;
    } else {
      const profile = await this.client.profile.findUnique({
        where: { handle },
        select: { id: true },
      });
      if (!profile) return null;
      authorId = profile.id;
    }

    return this.client.course.findFirst({
      where: { slug, isPublished: true, authorId },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
        },
        author: { select: COURSE_AUTHOR_SELECT },
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
