/**
 * Centralised URL builders for Course / Lesson learner pages.
 *
 * Course pages live under `/courses/{handle}/{slug}` where:
 *   - `handle` is the author's `Profile.handle` for UGC courses
 *   - `handle` is the reserved literal `OFFICIAL_HANDLE` for official courses
 *     whose `authorId` is NULL
 *
 * Keep all `/courses/...` href construction here so the URL scheme has a single
 * source of truth.
 */

export const OFFICIAL_HANDLE = "official";

export type CourseLinkable = {
  slug: string;
  author: { handle: string } | null;
};

export function authorHandle(author: { handle: string } | null): string {
  return author?.handle ?? OFFICIAL_HANDLE;
}

export function courseUrl(course: CourseLinkable): string {
  return `/courses/${authorHandle(course.author)}/${course.slug}`;
}

export function lessonUrl(course: CourseLinkable, lessonSlug: string): string {
  return `${courseUrl(course)}/lessons/${lessonSlug}`;
}

export function isOfficialHandle(handle: string): boolean {
  return handle === OFFICIAL_HANDLE;
}
