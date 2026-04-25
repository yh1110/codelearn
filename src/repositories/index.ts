import "server-only";

import { BookmarkRepository } from "./bookmark.repository";
import { CourseRepository } from "./course.repository";
import { LessonRepository } from "./lesson.repository";
import { NotificationRepository } from "./notification.repository";
import { ProfileRepository } from "./profile.repository";
import { ProgressRepository } from "./progress.repository";
import { SearchRepository } from "./search.repository";

export const bookmarkRepository = new BookmarkRepository();
export const courseRepository = new CourseRepository();
export const lessonRepository = new LessonRepository();
export const notificationRepository = new NotificationRepository();
export const profileRepository = new ProfileRepository();
export const progressRepository = new ProgressRepository();
export const searchRepository = new SearchRepository();

export type {
  CourseBookmarkWithCourse,
  LessonBookmarkWithLesson,
} from "./bookmark.repository";
export type {
  CourseAuthor,
  CourseWithLessonIds,
  CourseWithLessons,
  CourseWithLessonsAndAuthor,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.repository";
export type { CreateLessonInput, UpdateLessonInput } from "./lesson.repository";
export type { CreateNotificationInput } from "./notification.repository";
export type { ProfileUpdateInput, ProfileUpsertInput } from "./profile.repository";
export type { CourseSearchHit, LessonSearchHit } from "./search.repository";
export {
  BookmarkRepository,
  CourseRepository,
  LessonRepository,
  NotificationRepository,
  ProfileRepository,
  ProgressRepository,
  SearchRepository,
};
