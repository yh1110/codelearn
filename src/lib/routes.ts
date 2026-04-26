/**
 * Centralised URL builders for Course / Lesson / Collection / Problem
 * learner pages.
 *
 * Official content uses a flat `/courses/{slug}` namespace (no handle is
 * needed because Course is now official-only — issue #71).
 *
 * UGC content uses handle-scoped `/collections/{handle}/{slug}` URLs. The
 * actual route handlers under that path land in issue #72; the helpers here
 * build the URLs so that link sites (`MyCollections`, search results, etc.)
 * can be wired up without churning when the routes ship.
 *
 * `OFFICIAL_HANDLE` continues to live here as the reserved profile handle —
 * the schema split removed `Course.authorId` but `RESERVED_HANDLES` in
 * `types/profile.ts` still needs the literal so the value can't be claimed
 * as a user handle.
 */

export const OFFICIAL_HANDLE = "official";

export type CourseLinkable = {
  slug: string;
};

export type LessonLinkable = CourseLinkable;

export type CollectionLinkable = {
  slug: string;
  author: { handle: string };
};

export function courseUrl(course: CourseLinkable): string {
  return `/courses/${course.slug}`;
}

export function lessonUrl(course: CourseLinkable, lessonSlug: string): string {
  return `${courseUrl(course)}/lessons/${lessonSlug}`;
}

export function collectionUrl(collection: CollectionLinkable): string {
  return `/collections/${collection.author.handle}/${collection.slug}`;
}

export function problemUrl(collection: CollectionLinkable, problemSlug: string): string {
  return `${collectionUrl(collection)}/problems/${problemSlug}`;
}

export function isOfficialHandle(handle: string): boolean {
  return handle === OFFICIAL_HANDLE;
}
