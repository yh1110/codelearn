import "server-only";

import type { Course } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError, ValidationError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CourseRepository,
  type CourseWithLessonIds,
  type CourseWithLessons,
  courseRepository,
} from "@/repositories";
import { ensureAuthorOwnsCourse } from "./authorGuard";

export async function getCoursesWithLessons(
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessonIds[]> {
  logInfo("courseService.getCoursesWithLessons.start");
  try {
    const result = await repository.findAllPublishedWithLessons();
    logInfo("courseService.getCoursesWithLessons.success", { count: result.length });
    return result;
  } catch (error) {
    logError("courseService.getCoursesWithLessons.error", undefined, error);
    throw handleUnknownError(error);
  }
}

export async function getPublishedCoursesByNewest(
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessonIds[]> {
  logInfo("courseService.getPublishedCoursesByNewest.start");
  try {
    const result = await repository.findAllPublishedByNewest();
    logInfo("courseService.getPublishedCoursesByNewest.success", { count: result.length });
    return result;
  } catch (error) {
    logError("courseService.getPublishedCoursesByNewest.error", undefined, error);
    throw handleUnknownError(error);
  }
}

export async function getCourseBySlug(
  slug: string,
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessons> {
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

export async function getMyCourses(
  authorId: string,
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessonIds[]> {
  logInfo("courseService.getMyCourses.start", { authorId });
  try {
    const result = await repository.findByAuthor(authorId);
    logInfo("courseService.getMyCourses.success", { authorId, count: result.length });
    return result;
  } catch (error) {
    logError("courseService.getMyCourses.error", { authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function getMyCourseById(
  params: { id: string; authorId: string },
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  const { id, authorId } = params;
  logInfo("courseService.getMyCourseById.start", { id, authorId });
  try {
    const course = await ensureAuthorOwnsCourse(id, authorId, repository);
    logInfo("courseService.getMyCourseById.success", { id, authorId });
    return course;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export type CreateCourseParams = {
  authorId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
};

export async function createCourse(
  params: CreateCourseParams,
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  const { authorId, slug, title, description, order } = params;
  logInfo("courseService.createCourse.start", { authorId, slug });
  try {
    const course = await repository.create({
      authorId,
      slug,
      title,
      description,
      order,
    });
    logInfo("courseService.createCourse.success", { id: course.id, authorId });
    return course;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("courseService.createCourse.slugConflict", { slug });
      throw new ValidationError(`Course slug already exists: ${slug}`);
    }
    logError("courseService.createCourse.error", { authorId, slug }, error);
    throw handleUnknownError(error);
  }
}

export type UpdateCourseParams = {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  description: string;
  order: number;
};

export async function updateCourse(
  params: UpdateCourseParams,
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  const { id, authorId, slug, title, description, order } = params;
  logInfo("courseService.updateCourse.start", { id, authorId });
  try {
    await ensureAuthorOwnsCourse(id, authorId, repository);
    const course = await repository.update(id, { slug, title, description, order });
    logInfo("courseService.updateCourse.success", { id, authorId });
    return course;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("courseService.updateCourse.slugConflict", { id, slug });
      throw new ValidationError(`Course slug already exists: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("courseService.updateCourse.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("courseService.updateCourse.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function deleteCourse(
  params: { id: string; authorId: string },
  repository: CourseRepository = courseRepository,
): Promise<void> {
  const { id, authorId } = params;
  logInfo("courseService.deleteCourse.start", { id, authorId });
  try {
    await ensureAuthorOwnsCourse(id, authorId, repository);
    await repository.delete(id);
    logInfo("courseService.deleteCourse.success", { id, authorId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("courseService.deleteCourse.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("courseService.deleteCourse.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function togglePublishCourse(
  params: { id: string; authorId: string; isPublished: boolean },
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  const { id, authorId, isPublished } = params;
  logInfo("courseService.togglePublishCourse.start", { id, authorId, isPublished });
  try {
    await ensureAuthorOwnsCourse(id, authorId, repository);
    const course = await repository.togglePublish(id, isPublished);
    logInfo("courseService.togglePublishCourse.success", { id, authorId, isPublished });
    return course;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("courseService.togglePublishCourse.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("courseService.togglePublishCourse.error", { id, authorId }, error);
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
