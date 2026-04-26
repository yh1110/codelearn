import "server-only";

import type { Course } from "@prisma/client";
import { handleUnknownError, NotFoundError, ValidationError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CourseDetail,
  type CourseRepository,
  type CourseWithLessons,
  courseRepository,
} from "@/repositories";

// Course is now official-only (issue #71). Write operations are intentionally
// not exported until ADMIN role enforcement lands — admin authoring lives in
// a follow-up issue and will wrap createCourse / updateCourse / deleteCourse
// with `requireRole('ADMIN')`. For the time being this service exposes only
// read paths so the user-facing surface (home, course pages, search) stays
// functional without granting any UI the ability to mutate official content.

export async function getPublishedCourses(
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessons[]> {
  logInfo("courseService.getPublishedCourses.start");
  try {
    const result = await repository.findAllPublishedWithLessons();
    logInfo("courseService.getPublishedCourses.success", { count: result.length });
    return result;
  } catch (error) {
    logError("courseService.getPublishedCourses.error", undefined, error);
    throw handleUnknownError(error);
  }
}

export async function getCourseBySlug(
  slug: string,
  repository: CourseRepository = courseRepository,
): Promise<CourseDetail> {
  logInfo("courseService.getCourseBySlug.start", { slug });
  try {
    const course = await repository.findPublishedBySlugWithPublishedLessons(slug);
    if (!course) throw new NotFoundError(`Course not found: ${slug}`);
    logInfo("courseService.getCourseBySlug.success", {
      slug,
      lessonCount: course.lessons.length,
    });
    return course;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("courseService.getCourseBySlug.notFound", { slug });
      throw error;
    }
    logError("courseService.getCourseBySlug.error", { slug }, error);
    throw handleUnknownError(error);
  }
}

// TODO(admin-ui): wrap with requireRole('ADMIN') in the calling action once
// the admin authoring surface is added.
export type CreateCourseParams = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

export async function createCourse(
  params: CreateCourseParams,
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  const { slug, title, description, order } = params;
  logInfo("courseService.createCourse.start", { slug });
  try {
    const course = await repository.create({ slug, title, description, order });
    logInfo("courseService.createCourse.success", { id: course.id });
    return course;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("courseService.createCourse.slugConflict", { slug });
      throw new ValidationError(`Course slug already exists: ${slug}`);
    }
    logError("courseService.createCourse.error", { slug }, error);
    throw handleUnknownError(error);
  }
}

function isUniqueConstraintError(error: unknown, field?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  if (!field) return true;
  const target = e.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
}
