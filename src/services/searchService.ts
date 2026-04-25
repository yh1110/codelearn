import "server-only";

import { MIN_QUERY_LENGTH } from "@/config/search";
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
  // Distinguishes "we skipped the search because the query is too short" from
  // "we searched but found nothing" — the UI renders different empty states.
  tooShort: boolean;
  courses: CourseSearchHit[];
  lessons: LessonSearchHit[];
};

export async function search(
  query: string,
  repository: SearchRepository = searchRepository,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return { query: trimmed, tooShort: false, courses: [], lessons: [] };
  }
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { query: trimmed, tooShort: true, courses: [], lessons: [] };
  }

  // Log only the query length — raw search terms can be PII-adjacent and our
  // logging policy forbids sensitive payloads.
  logInfo("searchService.search.start", { queryLength: trimmed.length });
  try {
    const [courses, lessons] = await Promise.all([
      repository.searchCourses(trimmed),
      repository.searchLessons(trimmed),
    ]);
    logInfo("searchService.search.success", {
      queryLength: trimmed.length,
      courseCount: courses.length,
      lessonCount: lessons.length,
    });
    return { query: trimmed, tooShort: false, courses, lessons };
  } catch (error) {
    logError("searchService.search.error", { queryLength: trimmed.length }, error);
    throw handleUnknownError(error);
  }
}
