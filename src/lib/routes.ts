/**
 * Centralised URL builders for Course / Lesson / Collection / Problem
 * learner pages.
 *
 * Official content keeps the `/courses/{official}/{slug}` URL shape from
 * before the schema split (issue #71); the `[handle]` segment in
 * `src/app/(protected)/courses/[handle]/[slug]` is preserved and pinned to
 * the reserved `OFFICIAL_HANDLE` literal so that flattening to `/courses/{slug}`
 * can ship together with the broader URL redesign in issue #72.
 *
 * UGC content uses handle-scoped `/collections/{handle}/{slug}` URLs. The
 * actual route handlers under that path also land in issue #72; the helpers
 * here build the URLs so that link sites (`MyCollections`, search results,
 * etc.) can be wired up without churning when the routes ship.
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
  return `/courses/${OFFICIAL_HANDLE}/${course.slug}`;
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
