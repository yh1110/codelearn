/**
 * Centralised URL builders.
 *
 * Issue #72 reorganised the URL space into three namespaces:
 *
 * - **App-shared** : `/`, `/learn`, `/learn/{course}`, `/learn/{course}/{lesson}`
 * - **Handle-scoped** : `/{handle}`, `/{handle}/{collection}`,
 *   `/{handle}/{collection}/{problem}`, `/{handle}/bookmarks`
 * - **Session-private** : `/settings`, `/settings/profile`, `/notifications`,
 *   `/dashboard`
 *
 * Official Course / Lesson links land under `/learn/...`; handles do not
 * appear in the URL because Course is now official-only after the schema
 * split (issue #71). UGC Collection / Problem links land under the author's
 * `/{handle}/...` namespace. The `OFFICIAL_HANDLE` constant remains exported
 * as the canonical alias for authorId IS NULL content used by reserved-name
 * checks elsewhere.
 */

export const OFFICIAL_HANDLE = "official";

export type CourseLinkable = {
  slug: string;
};

export type CollectionLinkable = {
  slug: string;
  author: { handle: string };
};

export function learnIndexUrl(): string {
  return "/learn";
}

export function learnUrl(course: CourseLinkable): string {
  return `/learn/${course.slug}`;
}

export function lessonUrl(course: CourseLinkable, lessonSlug: string): string {
  return `${learnUrl(course)}/${lessonSlug}`;
}

export function collectionUrl(collection: CollectionLinkable): string {
  return `/${collection.author.handle}/${collection.slug}`;
}

export function problemUrl(collection: CollectionLinkable, problemSlug: string): string {
  return `${collectionUrl(collection)}/${problemSlug}`;
}

export function profileUrl(handle: string): string {
  return `/${handle}`;
}

export function bookmarksUrl(handle: string): string {
  return `${profileUrl(handle)}/bookmarks`;
}

export function settingsUrl(): string {
  return "/settings/profile";
}

export function isOfficialHandle(handle: string): boolean {
  return handle === OFFICIAL_HANDLE;
}
