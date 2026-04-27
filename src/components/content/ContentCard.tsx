import { BookText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContentCardProps = {
  href: string;
  title: string;
  description?: string | null;
  cover: ReactNode;
  /** Rendered above the title (e.g. <OfficialBadge />). */
  topBadge?: ReactNode;
  /** Rendered between title and progress (e.g. <HandleLink /> or "公式" label). */
  byline?: ReactNode;
  /** Tag chips. */
  chips?: ReactNode;
  /** Progress 0..1; null hides the bar. */
  progress?: { done: number; total: number } | null;
  /** Footer label, e.g. "12 レッスン" or "8 問題". */
  countLabel?: { count: number; suffix: string };
};

/**
 * Shared card primitive for /learn (CourseCard) and / (CollectionCard).
 * Uses the "stretched link" pattern: the title is the canonical anchor and
 * its `::before` pseudo-element covers the whole card so the entire surface
 * is clickable. Nested interactive children (HandleLink, BookmarkButton…)
 * sit on a higher stacking context (`relative z-10`) so they remain
 * independently clickable instead of nesting inside another anchor.
 */
export function ContentCard({
  href,
  title,
  description,
  cover,
  topBadge,
  byline,
  chips,
  progress,
  countLabel,
}: ContentCardProps) {
  const pct =
    progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[14px] transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
      )}
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className="relative block">
        {cover}
        {topBadge ? <span className="absolute top-2.5 right-2.5 z-10">{topBadge}</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3
          className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          <Link
            href={href}
            className={cn(
              "block transition group-hover:opacity-90",
              "before:absolute before:inset-0 before:z-0 before:content-['']",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)] focus-visible:rounded-[14px]",
            )}
          >
            {title}
          </Link>
        </h3>

        {byline ? (
          <div className="relative z-10 flex w-fit items-center gap-1.5">{byline}</div>
        ) : null}

        {description ? (
          <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {description}
          </p>
        ) : null}

        {chips ? <div className="flex flex-wrap gap-1.5">{chips}</div> : null}

        {progress ? (
          <div className="mt-auto flex items-center gap-3">
            <div className="cm-progress flex-1">
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="cm-mono" style={{ color: "var(--text-3)" }}>
              {progress.done}/{progress.total}
            </span>
          </div>
        ) : null}

        {countLabel ? (
          <div
            className="flex items-center gap-3 border-t pt-2.5 text-[12px]"
            style={{ borderColor: "var(--line-1)", color: "var(--text-3)" }}
          >
            <span className="inline-flex items-center gap-1">
              <BookText className="size-3" aria-hidden="true" />
              <b style={{ color: "var(--text-1)" }}>{countLabel.count}</b> {countLabel.suffix}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
