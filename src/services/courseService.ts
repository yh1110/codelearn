import "server-only";

import { handleUnknownError, NotFoundError } from "@/lib/errors";
import {
  type CourseRepository,
  type CourseWithLessonIds,
  type CourseWithLessons,
  courseRepository,
} from "@/repositories";

export async function getCoursesWithLessons(
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessonIds[]> {
  try {
    return await repository.findAllWithLessonIds();
  } catch (error) {
    throw handleUnknownError(error);
  }
}

export async function getCourseBySlug(
  slug: string,
  repository: CourseRepository = courseRepository,
): Promise<CourseWithLessons> {
  try {
    const course = await repository.findBySlugWithLessons(slug);
    if (!course) throw new NotFoundError(`Course not found: ${slug}`);
    return course;
  } catch (error) {
    throw handleUnknownError(error);
  }
}
