import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import {
  type BookmarkCollectionRepository,
  type BookmarkCourseRepository,
  type BookmarkLessonRepository,
  type BookmarkProblemRepository,
  bookmarkCollectionRepository,
  bookmarkCourseRepository,
  bookmarkLessonRepository,
  bookmarkProblemRepository,
  type CollectionBookmarkWithCollection,
  type CourseBookmarkWithCourse,
  type LessonBookmarkWithLesson,
  type ProblemBookmarkWithProblem,
} from "@/repositories";

export async function toggleCourseBookmark(
  params: { userId: string; courseId: string },
  repository: BookmarkCourseRepository = bookmarkCourseRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, courseId } = params;
  logInfo("bookmarkService.toggleCourseBookmark.start", { userId, courseId });
  try {
    const existing = await repository.find(userId, courseId);
    if (existing) {
      await repository.delete(userId, courseId);
      logInfo("bookmarkService.toggleCourseBookmark.success", {
        userId,
        courseId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.create(userId, courseId);
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
  repository: BookmarkLessonRepository = bookmarkLessonRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, lessonId } = params;
  logInfo("bookmarkService.toggleLessonBookmark.start", { userId, lessonId });
  try {
    const existing = await repository.find(userId, lessonId);
    if (existing) {
      await repository.delete(userId, lessonId);
      logInfo("bookmarkService.toggleLessonBookmark.success", {
        userId,
        lessonId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.create(userId, lessonId);
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

export async function toggleCollectionBookmark(
  params: { userId: string; collectionId: string },
  repository: BookmarkCollectionRepository = bookmarkCollectionRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, collectionId } = params;
  logInfo("bookmarkService.toggleCollectionBookmark.start", { userId, collectionId });
  try {
    const existing = await repository.find(userId, collectionId);
    if (existing) {
      await repository.delete(userId, collectionId);
      logInfo("bookmarkService.toggleCollectionBookmark.success", {
        userId,
        collectionId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.create(userId, collectionId);
    logInfo("bookmarkService.toggleCollectionBookmark.success", {
      userId,
      collectionId,
      bookmarked: true,
    });
    return { bookmarked: true };
  } catch (error) {
    logError("bookmarkService.toggleCollectionBookmark.error", { userId, collectionId }, error);
    throw handleUnknownError(error);
  }
}

export async function toggleProblemBookmark(
  params: { userId: string; problemId: string },
  repository: BookmarkProblemRepository = bookmarkProblemRepository,
): Promise<{ bookmarked: boolean }> {
  const { userId, problemId } = params;
  logInfo("bookmarkService.toggleProblemBookmark.start", { userId, problemId });
  try {
    const existing = await repository.find(userId, problemId);
    if (existing) {
      await repository.delete(userId, problemId);
      logInfo("bookmarkService.toggleProblemBookmark.success", {
        userId,
        problemId,
        bookmarked: false,
      });
      return { bookmarked: false };
    }
    await repository.create(userId, problemId);
    logInfo("bookmarkService.toggleProblemBookmark.success", {
      userId,
      problemId,
      bookmarked: true,
    });
    return { bookmarked: true };
  } catch (error) {
    logError("bookmarkService.toggleProblemBookmark.error", { userId, problemId }, error);
    throw handleUnknownError(error);
  }
}

export async function isCourseBookmarked(
  params: { userId: string; courseId: string },
  repository: BookmarkCourseRepository = bookmarkCourseRepository,
): Promise<boolean> {
  const { userId, courseId } = params;
  try {
    return (await repository.find(userId, courseId)) !== null;
  } catch (error) {
    logError("bookmarkService.isCourseBookmarked.error", { userId, courseId }, error);
    throw handleUnknownError(error);
  }
}

export async function isLessonBookmarked(
  params: { userId: string; lessonId: string },
  repository: BookmarkLessonRepository = bookmarkLessonRepository,
): Promise<boolean> {
  const { userId, lessonId } = params;
  try {
    return (await repository.find(userId, lessonId)) !== null;
  } catch (error) {
    logError("bookmarkService.isLessonBookmarked.error", { userId, lessonId }, error);
    throw handleUnknownError(error);
  }
}

export async function isCollectionBookmarked(
  params: { userId: string; collectionId: string },
  repository: BookmarkCollectionRepository = bookmarkCollectionRepository,
): Promise<boolean> {
  const { userId, collectionId } = params;
  try {
    return (await repository.find(userId, collectionId)) !== null;
  } catch (error) {
    logError("bookmarkService.isCollectionBookmarked.error", { userId, collectionId }, error);
    throw handleUnknownError(error);
  }
}

export async function isProblemBookmarked(
  params: { userId: string; problemId: string },
  repository: BookmarkProblemRepository = bookmarkProblemRepository,
): Promise<boolean> {
  const { userId, problemId } = params;
  try {
    return (await repository.find(userId, problemId)) !== null;
  } catch (error) {
    logError("bookmarkService.isProblemBookmarked.error", { userId, problemId }, error);
    throw handleUnknownError(error);
  }
}

export type UserBookmarks = {
  courses: CourseBookmarkWithCourse[];
  lessons: LessonBookmarkWithLesson[];
  collections: CollectionBookmarkWithCollection[];
  problems: ProblemBookmarkWithProblem[];
};

export async function getUserBookmarks(
  userId: string,
  repos: {
    course?: BookmarkCourseRepository;
    lesson?: BookmarkLessonRepository;
    collection?: BookmarkCollectionRepository;
    problem?: BookmarkProblemRepository;
  } = {},
): Promise<UserBookmarks> {
  const courseRepo = repos.course ?? bookmarkCourseRepository;
  const lessonRepo = repos.lesson ?? bookmarkLessonRepository;
  const collectionRepo = repos.collection ?? bookmarkCollectionRepository;
  const problemRepo = repos.problem ?? bookmarkProblemRepository;

  logInfo("bookmarkService.getUserBookmarks.start", { userId });
  try {
    const [courses, lessons, collections, problems] = await Promise.all([
      courseRepo.findByUser(userId),
      lessonRepo.findByUser(userId),
      collectionRepo.findByUser(userId),
      problemRepo.findByUser(userId),
    ]);
    logInfo("bookmarkService.getUserBookmarks.success", {
      userId,
      courseCount: courses.length,
      lessonCount: lessons.length,
      collectionCount: collections.length,
      problemCount: problems.length,
    });
    return { courses, lessons, collections, problems };
  } catch (error) {
    logError("bookmarkService.getUserBookmarks.error", { userId }, error);
    throw handleUnknownError(error);
  }
}
