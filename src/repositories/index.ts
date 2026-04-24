import "server-only";

import { CourseRepository } from "./course.repository";
import { LessonRepository } from "./lesson.repository";
import { ProfileRepository } from "./profile.repository";
import { ProgressRepository } from "./progress.repository";

export const courseRepository = new CourseRepository();
export const lessonRepository = new LessonRepository();
export const profileRepository = new ProfileRepository();
export const progressRepository = new ProgressRepository();

export type {
  CourseWithLessonIds,
  CourseWithLessons,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.repository";
export type { CreateLessonInput, UpdateLessonInput } from "./lesson.repository";
export { CourseRepository, LessonRepository, ProfileRepository, ProgressRepository };
