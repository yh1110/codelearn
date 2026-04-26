/**
 * Reserved names for URL namespace safety.
 *
 * `/{handle}` and `/{handle}/{collection}` share the top-level (protected)
 * route tree with static segments such as `/learn`, `/settings`, and
 * `/dashboard`. Next.js prefers static segments over dynamic ones, so an end
 * user who claimed `learn` as their handle would silently never resolve. We
 * forbid those handles up front instead of relying on routing precedence.
 *
 * Likewise, a Collection slug of `bookmarks` would shadow `/{handle}/bookmarks`
 * (the bookmarks list lives at the same depth). We block that family of slugs
 * to keep handle-scoped subpaths predictable.
 */

import { OFFICIAL_HANDLE } from "./routes";

/**
 * Handles that may not be claimed by an end user.
 *
 * Includes:
 * - The `official` alias for authorId IS NULL content (kept here in addition
 *   to `OFFICIAL_HANDLE` so a single set covers both checks).
 * - Top-level static routes under `(protected)` and `app/`.
 * - Generic web roots (`favicon.ico`, `robots.txt`) so handles can never
 *   collide with browser-issued requests.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  OFFICIAL_HANDLE,
  "me",
  "settings",
  "dashboard",
  "login",
  "auth",
  "api",
  "learn",
  "courses",
  "lessons",
  "explore",
  "search",
  "notifications",
  "bookmarks",
  "admin",
  "official",
  "u",
  "public",
  "static",
  "_next",
  "favicon.ico",
  "robots.txt",
]);

/**
 * Collection slugs that may not be created. They would otherwise collide
 * with handle-scoped subpaths under `/{handle}/...`.
 */
export const RESERVED_COLLECTION_SLUGS: ReadonlySet<string> = new Set([
  "bookmarks",
  "settings",
  "edit",
  "manage",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}

export function isReservedCollectionSlug(slug: string): boolean {
  return RESERVED_COLLECTION_SLUGS.has(slug.toLowerCase());
}
