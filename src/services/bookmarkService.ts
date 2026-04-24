import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import {
  type BookmarkRepository,
  bookmarkRepository,
  type CourseBookmarkWithCourse,
  type LessonBookmarkWithLesson,
} from "@/repositories";

export async function toggleCourseBookmark(
  params: { userId: string; courseId: string },
  repository: BookmarkRepository = bookmarkRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, courseId } = params;
  logInfo("bookmarkService.toggleCourseBookmark.start", { userId, courseId });
  try {
    const existing = await repository.findCourseBookmark(userId, courseId);
    if (existing) {
      await repository.deleteCourseBookmark(userId, courseId);
      logInfo("bookmarkService.toggleCourseBookmark.success", {
        userId,
        courseId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.createCourseBookmark(userId, courseId);
    logInfo("bookmarkService.toggleCourseBookmark.success", {
      userId,
      courseId,
      bookmarked: true,
    });
    return { bookmarked: true };
  } catch (error) {
    logError("bookmarkService.toggleCourseBookmark.error", { userId, courseId }, error);
    throw handleUnknownError(error);
  }
}

export async function toggleLessonBookmark(
  params: { userId: string; lessonId: string },
  repository: BookmarkRepository = bookmarkRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, lessonId } = params;
  logInfo("bookmarkService.toggleLessonBookmark.start", { userId, lessonId });
  try {
    const existing = await repository.findLessonBookmark(userId, lessonId);
    if (existing) {
      await repository.deleteLessonBookmark(userId, lessonId);
      logInfo("bookmarkService.toggleLessonBookmark.success", {
        userId,
        lessonId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.createLessonBookmark(userId, lessonId);
    logInfo("bookmarkService.toggleLessonBookmark.success", {
      userId,
      lessonId,
      bookmarked: true,
    });
    return { bookmarked: true };
  } catch (error) {
    logError("bookmarkService.toggleLessonBookmark.error", { userId, lessonId }, error);
    throw handleUnknownError(error);
  }
}

export async function isCourseBookmarked(
  params: { userId: string; courseId: string },
  repository: BookmarkRepository = bookmarkRepository,
): Promise<boolean> {
  const { userId, courseId } = params;
  try {
    const existing = await repository.findCourseBookmark(userId, courseId);
    return existing !== null;
  } catch (error) {
    logError("bookmarkService.isCourseBookmarked.error", { userId, courseId }, error);
    throw handleUnknownError(error);
  }
}

export async function isLessonBookmarked(
  params: { userId: string; lessonId: string },
  repository: BookmarkRepository = bookmarkRepository,
): Promise<boolean> {
  const { userId, lessonId } = params;
  try {
    const existing = await repository.findLessonBookmark(userId, lessonId);
    return existing !== null;
  } catch (error) {
    logError("bookmarkService.isLessonBookmarked.error", { userId, lessonId }, error);
    throw handleUnknownError(error);
  }
}

export type UserBookmarks = {
  courses: CourseBookmarkWithCourse[];
  lessons: LessonBookmarkWithLesson[];
};

export async function getUserBookmarks(
  userId: string,
  repository: BookmarkRepository = bookmarkRepository,
): Promise<UserBookmarks> {
  logInfo("bookmarkService.getUserBookmarks.start", { userId });
  try {
    const [courses, lessons] = await Promise.all([
      repository.findCourseBookmarksByUser(userId),
      repository.findLessonBookmarksByUser(userId),
    ]);
    logInfo("bookmarkService.getUserBookmarks.success", {
      userId,
      courseCount: courses.length,
      lessonCount: lessons.length,
    });
    return { courses, lessons };
  } catch (error) {
    logError("bookmarkService.getUserBookmarks.error", { userId }, error);
    throw handleUnknownError(error);
  }
}
