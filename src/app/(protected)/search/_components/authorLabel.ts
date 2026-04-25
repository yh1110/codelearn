// Privacy: never derive a handle from email; keep it to the display name.
export function authorLabel(name: string | null | undefined): string {
  return name ?? "Anonymous";
}
