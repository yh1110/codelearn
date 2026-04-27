import "server-only";

import type { Prisma } from "@prisma/client";
import { SEARCH_LIMIT } from "@/config/search";
import { BaseRepository } from "./base.repository";

export type CourseSearchHit = Prisma.CourseGetPayload<{
  include: {
    lessons: { where: { isPublished: true }; select: { id: true } };
  };
}>;

export type LessonSearchHit = Prisma.LessonGetPayload<{
  include: {
    course: {
      select: {
        id: true;
        slug: true;
        title: true;
      };
    };
  };
}>;

export type CollectionSearchHit = Prisma.CollectionGetPayload<{
  include: {
    author: { select: { id: true; name: true; handle: true; avatarUrl: true } };
    problems: { where: { isPublished: true }; select: { id: true } };
  };
}>;

export type ProblemSearchHit = Prisma.ProblemGetPayload<{
  include: {
    collection: {
      select: {
        id: true;
        slug: true;
        title: true;
        author: { select: { id: true; name: true; handle: true } };
      };
    };
  };
}>;

export class SearchRepository extends BaseRepository {
  async searchCourses(query: string): Promise<CourseSearchHit[]> {
    return this.client.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: SEARCH_LIMIT,
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async searchLessons(query: string): Promise<LessonSearchHit[]> {
    return this.client.lesson.findMany({
      where: {
        isPublished: true,
        course: { isPublished: true },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { contentMd: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: SEARCH_LIMIT,
      include: {
        course: {
          select: { id: true, slug: true, title: true },
        },
      },
    });
  }

  async searchCollections(query: string): Promise<CollectionSearchHit[]> {
    return this.client.collection.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: SEARCH_LIMIT,
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        problems: {
          where: { isPublished: true },
          select: { id: true },
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async searchProblems(query: string): Promise<ProblemSearchHit[]> {
    return this.client.problem.findMany({
      where: {
        isPublished: true,
        collection: { isPublished: true },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { contentMd: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: SEARCH_LIMIT,
      include: {
        collection: {
          select: {
            id: true,
            slug: true,
            title: true,
            author: { select: { id: true, name: true, handle: true } },
          },
        },
      },
    });
  }
}
