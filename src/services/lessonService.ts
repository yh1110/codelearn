import "server-only";

import type { Lesson } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError, ValidationError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CourseRepository,
  courseRepository,
  type LessonRepository,
  lessonRepository,
} from "@/repositories";
import { ensureAuthorOwnsCourse, ensureAuthorOwnsLesson } from "./authorGuard";

export async function getLessonsByCourse(
  params: { courseId: string; authorId: string },
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson[]> {
  const { courseId, authorId } = params;
  logInfo("lessonService.getLessonsByCourse.start", { courseId, authorId });
  try {
    await ensureAuthorOwnsCourse(courseId, authorId, courseRepo);
    const lessons = await repository.findByCourse(courseId);
    logInfo("lessonService.getLessonsByCourse.success", {
      courseId,
      authorId,
      count: lessons.length,
    });
    return lessons;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function getMyLessonById(
  params: { id: string; authorId: string },
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson> {
  const { id, authorId } = params;
  logInfo("lessonService.getMyLessonById.start", { id, authorId });
  try {
    const lesson = await ensureAuthorOwnsLesson(id, authorId, repository, courseRepo);
    logInfo("lessonService.getMyLessonById.success", { id, authorId });
    return lesson;
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export type CreateLessonParams = {
  courseId: string;
  authorId: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  order: number;
};

export async function createLesson(
  params: CreateLessonParams,
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson> {
  const { courseId, authorId, slug, title, contentMd, starterCode, expectedOutput, order } = params;
  logInfo("lessonService.createLesson.start", { courseId, authorId, slug });
  try {
    await ensureAuthorOwnsCourse(courseId, authorId, courseRepo);
    const lesson = await repository.create({
      courseId,
      slug,
      title,
      contentMd,
      starterCode,
      expectedOutput,
      order,
    });
    logInfo("lessonService.createLesson.success", { id: lesson.id, courseId });
    return lesson;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("lessonService.createLesson.slugConflict", { courseId, slug });
      throw new ValidationError(`Lesson slug already exists in this course: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("lessonService.createLesson.notFound", { courseId });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("lessonService.createLesson.error", { courseId, authorId, slug }, error);
    throw handleUnknownError(error);
  }
}

export type UpdateLessonParams = {
  id: string;
  authorId: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  order: number;
};

export async function updateLesson(
  params: UpdateLessonParams,
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson> {
  const { id, authorId, slug, title, contentMd, starterCode, expectedOutput, order } = params;
  logInfo("lessonService.updateLesson.start", { id, authorId });
  try {
    await ensureAuthorOwnsLesson(id, authorId, repository, courseRepo);
    const lesson = await repository.update(id, {
      slug,
      title,
      contentMd,
      starterCode,
      expectedOutput,
      order,
    });
    logInfo("lessonService.updateLesson.success", { id, authorId });
    return lesson;
  } catch (error) {
    if (isUniqueConstraintError(error, "slug")) {
      logWarn("lessonService.updateLesson.slugConflict", { id, slug });
      throw new ValidationError(`Lesson slug already exists in this course: ${slug}`);
    }
    if (error instanceof NotFoundError) {
      logWarn("lessonService.updateLesson.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("lessonService.updateLesson.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function deleteLesson(
  params: { id: string; authorId: string },
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<void> {
  const { id, authorId } = params;
  logInfo("lessonService.deleteLesson.start", { id, authorId });
  try {
    await ensureAuthorOwnsLesson(id, authorId, repository, courseRepo);
    await repository.delete(id);
    logInfo("lessonService.deleteLesson.success", { id, authorId });
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("lessonService.deleteLesson.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("lessonService.deleteLesson.error", { id, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function togglePublishLesson(
  params: { id: string; authorId: string; isPublished: boolean },
  repository: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson> {
  const { id, authorId, isPublished } = params;
  logInfo("lessonService.togglePublishLesson.start", { id, authorId, isPublished });
  try {
    await ensureAuthorOwnsLesson(id, authorId, repository, courseRepo);
    const lesson = await repository.togglePublish(id, isPublished);
    logInfo("lessonService.togglePublishLesson.success", { id, authorId, isPublished });
    return lesson;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("lessonService.togglePublishLesson.notFound", { id });
      throw error;
    }
    if (error instanceof ForbiddenError) throw error;
    logError("lessonService.togglePublishLesson.error", { id, authorId }, error);
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
