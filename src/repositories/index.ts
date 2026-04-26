import "server-only";

import { BookmarkCollectionRepository } from "./bookmarkCollection.repository";
import { BookmarkCourseRepository } from "./bookmarkCourse.repository";
import { BookmarkLessonRepository } from "./bookmarkLesson.repository";
import { BookmarkProblemRepository } from "./bookmarkProblem.repository";
import { CollectionRepository } from "./collection.repository";
import { CourseRepository } from "./course.repository";
import { HandleReservationRepository } from "./handleReservation.repository";
import { LessonRepository } from "./lesson.repository";
import { LessonProgressRepository } from "./lessonProgress.repository";
import { NotificationRepository } from "./notification.repository";
import { ProblemRepository } from "./problem.repository";
import { ProblemProgressRepository } from "./problemProgress.repository";
import { ProfileRepository } from "./profile.repository";
import { SearchRepository } from "./search.repository";

export const bookmarkCollectionRepository = new BookmarkCollectionRepository();
export const bookmarkCourseRepository = new BookmarkCourseRepository();
export const bookmarkLessonRepository = new BookmarkLessonRepository();
export const bookmarkProblemRepository = new BookmarkProblemRepository();
export const collectionRepository = new CollectionRepository();
export const courseRepository = new CourseRepository();
export const handleReservationRepository = new HandleReservationRepository();
export const lessonRepository = new LessonRepository();
export const lessonProgressRepository = new LessonProgressRepository();
export const notificationRepository = new NotificationRepository();
export const problemRepository = new ProblemRepository();
export const problemProgressRepository = new ProblemProgressRepository();
export const profileRepository = new ProfileRepository();
export const searchRepository = new SearchRepository();

export type { CollectionBookmarkWithCollection } from "./bookmarkCollection.repository";
export type { CourseBookmarkWithCourse } from "./bookmarkCourse.repository";
export type { LessonBookmarkWithLesson } from "./bookmarkLesson.repository";
export type { ProblemBookmarkWithProblem } from "./bookmarkProblem.repository";
export type {
  CollectionAuthor,
  CollectionDetailWithAuthor,
  CollectionWithProblemIds,
  CollectionWithProblemsAndAuthor,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.repository";
export type {
  CourseDetail,
  CourseWithLessonIds,
  CourseWithLessons,
  CreateCourseInput,
  UpdateCourseInput,
} from "./course.repository";
export type { CreateLessonInput, UpdateLessonInput } from "./lesson.repository";
export type { CreateNotificationInput } from "./notification.repository";
export type { CreateProblemInput, UpdateProblemInput } from "./problem.repository";
export type { ProfileUpdateInput, ProfileUpsertInput } from "./profile.repository";
export type {
  CollectionSearchHit,
  CourseSearchHit,
  LessonSearchHit,
  ProblemSearchHit,
} from "./search.repository";
export {
  BookmarkCollectionRepository,
  BookmarkCourseRepository,
  BookmarkLessonRepository,
  BookmarkProblemRepository,
  CollectionRepository,
  CourseRepository,
  HandleReservationRepository,
  LessonProgressRepository,
  LessonRepository,
  NotificationRepository,
  ProblemProgressRepository,
  ProblemRepository,
  ProfileRepository,
  SearchRepository,
};
