// Shared cover-art helpers for course tiles. Used by CourseCard and the
// bookmarks list so adding a new cover variant only needs one edit.

const COVER_VARIANTS = [
  "cm-cover-1",
  "cm-cover-2",
  "cm-cover-3",
  "cm-cover-4",
  "cm-cover-5",
  "cm-cover-6",
] as const;

export function coverFor(index: number) {
  return COVER_VARIANTS[index % COVER_VARIANTS.length];
}

export function glyphFor(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "TS";
  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}
