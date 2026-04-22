import "server-only";

import { CourseRepository } from "./course.repository";
import { ProfileRepository } from "./profile.repository";
import { ProgressRepository } from "./progress.repository";

export const courseRepository = new CourseRepository();
export const profileRepository = new ProfileRepository();
export const progressRepository = new ProgressRepository();

export type { CourseWithLessonIds, CourseWithLessons } from "./course.repository";
export { CourseRepository, ProfileRepository, ProgressRepository };
