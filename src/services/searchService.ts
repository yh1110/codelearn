import "server-only";

import { handleUnknownError } from "@/lib/errors";
import { logError, logInfo } from "@/lib/logging";
import {
  type CourseSearchHit,
  type LessonSearchHit,
  type SearchRepository,
  searchRepository,
} from "@/repositories";

export type SearchResults = {
  query: string;
  courses: CourseSearchHit[];
  lessons: LessonSearchHit[];
};

// Single-character queries explode the ILIKE cost and match nearly everything,
// so require at least 2 characters before hitting the repository.
const MIN_QUERY_LENGTH = 2;

export async function search(
  query: string,
  repository: SearchRepository = searchRepository,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { query: trimmed, courses: [], lessons: [] };
  }

  logInfo("searchService.search.start", { query: trimmed });
  try {
    const [courses, lessons] = await Promise.all([
      repository.searchCourses(trimmed),
      repository.searchLessons(trimmed),
    ]);
    logInfo("searchService.search.success", {
      query: trimmed,
      courseCount: courses.length,
      lessonCount: lessons.length,
    });
    return { query: trimmed, courses, lessons };
  } catch (error) {
    logError("searchService.search.error", { query: trimmed }, error);
    throw handleUnknownError(error);
  }
}
