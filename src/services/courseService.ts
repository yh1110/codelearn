import "server-only";

import { handleUnknownError, NotFoundError } from "@/lib/errors";
import { logError, logInfo, logWarn } from "@/lib/logging";
import {
  type CourseRepository,
  type CourseWithLessonIds,
  type CourseWithLessons,
  courseRepository,
} from "@/repositories";

export async function getCoursesWithLessons(
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessonIds[]> {
  logInfo("courseService.getCoursesWithLessons.start");
  try {
    const result = await repository.findAllWithLessonIds();
    logInfo("courseService.getCoursesWithLessons.success", { count: result.length });
    return result;
  } catch (error) {
    logError("courseService.getCoursesWithLessons.error", undefined, error);
    throw handleUnknownError(error);
  }
}

export async function getCourseBySlug(
  slug: string,
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessons> {
  logInfo("courseService.getCourseBySlug.start", { slug });
  try {
    const course = await repository.findBySlugWithLessons(slug);
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
