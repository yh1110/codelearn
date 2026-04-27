import { BookText } from "lucide-react";
import Link from "next/link";
import { learnUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CourseWithLessons } from "@/repositories";
import { coverFor, glyphFor } from "./courseCover";

type Props = {
  course: CourseWithLessons;
  index: number;
  completedIds: Set<string>;
};

export function CourseCard({ course, index, completedIds }: Props) {
  const total = course.lessons.length;
  const done = course.lessons.filter((l) => completedIds.has(l.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      href={learnUrl(course)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[14px] transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
      )}
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className={cn("cm-cover", coverFor(index))}>
        <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
          <span className="cm-diff-badge cm-diff-1">初級</span>
        </div>
        <span className="cm-cover-glyph" aria-hidden="true">
          {glyphFor(course.title)}
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
            ✓
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
            公式
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
