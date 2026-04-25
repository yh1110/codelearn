import { BookText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CourseAuthor, CourseWithLessonsAndAuthor } from "@/repositories";

const COVER_VARIANTS = [
  "cm-cover-1",
  "cm-cover-2",
  "cm-cover-3",
  "cm-cover-4",
  "cm-cover-5",
  "cm-cover-6",
] as const;

function coverForIndex(index: number) {
  return COVER_VARIANTS[index % COVER_VARIANTS.length];
}

function glyphForTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "TS";
  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}

function authorLabel(author: CourseAuthor | null): string {
  // Fall back to "Anonymous" when the author didn't set a display name —
  // do NOT derive a handle from the email address (privacy).
  return author?.name ?? "Anonymous";
}

function authorInitial(author: CourseAuthor | null): string {
  const label = authorLabel(author);
  return (Array.from(label.trim())[0] ?? "?").toUpperCase();
}

type Props = {
  course: CourseWithLessonsAndAuthor;
  index: number;
  completedIds: Set<string>;
};

export function CourseCard({ course, index, completedIds }: Props) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => completedIds.has(l.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[14px] transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
      )}
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className={cn("cm-cover", coverForIndex(index))}>
        <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
          <span className="cm-diff-badge cm-diff-1">初級</span>
        </div>
        <span className="cm-cover-glyph" aria-hidden="true">
          {glyphForTitle(course.title)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3
          className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {course.title}
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="cm-avatar cm-avatar-sm" aria-hidden="true">
            {authorInitial(course.author)}
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
            {authorLabel(course.author)}
          </span>
        </div>

        {course.description ? (
          <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {course.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <span className="cm-chip">#TypeScript</span>
          <span className="cm-chip">#基礎</span>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <div className="cm-progress flex-1">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="cm-mono" style={{ color: "var(--text-3)" }}>
            {done}/{total}
          </span>
        </div>
        <div
          className="flex items-center gap-3 border-t pt-2.5 text-[12px]"
          style={{ borderColor: "var(--line-1)", color: "var(--text-3)" }}
        >
          <span className="inline-flex items-center gap-1">
            <BookText className="size-3" aria-hidden="true" />
            <b style={{ color: "var(--text-1)" }}>{total}</b> レッスン
          </span>
        </div>
      </div>
    </Link>
  );
}
