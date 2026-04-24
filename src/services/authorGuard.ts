import "server-only";

import type { Course, Lesson } from "@prisma/client";
import { ForbiddenError, handleUnknownError, NotFoundError } from "@/lib/errors";
import { logError, logWarn } from "@/lib/logging";
import {
  type CourseRepository,
  courseRepository,
  type LessonRepository,
  lessonRepository,
} from "@/repositories";

export async function ensureAuthorOwnsCourse(
  courseId: string,
  authorId: string,
  repository: CourseRepository = courseRepository,
): Promise<Course> {
  try {
    const course = await repository.findById(courseId);
    if (!course) throw new NotFoundError(`Course not found: ${courseId}`);
    if (course.authorId !== authorId) {
      throw new ForbiddenError(`Not the author of course: ${courseId}`);
    }
    return course;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("authorGuard.ensureAuthorOwnsCourse.notFound", { courseId });
      throw error;
    }
    if (error instanceof ForbiddenError) {
      logWarn("authorGuard.ensureAuthorOwnsCourse.forbidden", { courseId, authorId });
      throw error;
    }
    logError("authorGuard.ensureAuthorOwnsCourse.error", { courseId, authorId }, error);
    throw handleUnknownError(error);
  }
}

export async function ensureAuthorOwnsLesson(
  lessonId: string,
  authorId: string,
  lessonRepo: LessonRepository = lessonRepository,
  courseRepo: CourseRepository = courseRepository,
): Promise<Lesson> {
  try {
    const lesson = await lessonRepo.findById(lessonId);
    if (!lesson) throw new NotFoundError(`Lesson not found: ${lessonId}`);
    await ensureAuthorOwnsCourse(lesson.courseId, authorId, courseRepo);
    return lesson;
  } catch (error) {
    if (error instanceof NotFoundError) {
      logWarn("authorGuard.ensureAuthorOwnsLesson.notFound", { lessonId });
      throw error;
    }
    if (error instanceof ForbiddenError) {
      logWarn("authorGuard.ensureAuthorOwnsLesson.forbidden", { lessonId, authorId });
      throw error;
    }
    logError("authorGuard.ensureAuthorOwnsLesson.error", { lessonId, authorId }, error);
    throw handleUnknownError(error);
  }
}
