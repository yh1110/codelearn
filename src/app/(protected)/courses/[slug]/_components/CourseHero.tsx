import { Play } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/BookmarkButton";
import type { CourseWithLessons } from "@/repositories";

type CourseHeroProps = {
  course: CourseWithLessons;
  done: number;
  total: number;
  pct: number;
  bookmarked: boolean;
};

export function CourseHero({ course, done, total, pct, bookmarked }: CourseHeroProps) {
  const firstLesson = course.lessons[0];

  return (
    <section
      className="relative mb-7 overflow-hidden rounded-[20px] p-8"
      style={{ border: "1px solid var(--line-1)", isolation: "isolate", minHeight: 220 }}
    >
      <div aria-hidden="true" className="cm-cover-1 absolute inset-0" style={{ zIndex: 0 }} />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 20%, var(--bg-0) 100%), linear-gradient(90deg, var(--bg-0) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-[680px]">
        <div className="flex items-center gap-2">
          <span className="cm-diff-badge cm-diff-1">初級</span>
          <span className="cm-chip">{total} レッスン</span>
        </div>
        <h1 className="my-3 font-bold text-[32px] tracking-tight">{course.title}</h1>
        <p className="m-0 text-[14px]" style={{ color: "var(--text-2)" }}>
          {course.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {firstLesson ? (
            <Link
              href={`/courses/${course.slug}/lessons/${firstLesson.slug}`}
              className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2 font-semibold text-[13px] transition"
              style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
            >
              <Play className="size-3.5" aria-hidden="true" />
              {done > 0 && done < total ? "続きから学ぶ" : "最初から始める"}
            </Link>
          ) : null}
          <BookmarkButton target="course" courseId={course.id} bookmarked={bookmarked} />
        </div>
      </div>

      <div
        className="relative z-10 mt-5 grid items-center gap-4 border-t pt-4"
        style={{ borderColor: "var(--line-1)", gridTemplateColumns: "1fr auto" }}
      >
        <div>
          <div className="mb-1.5 flex justify-between">
            <span className="cm-label">あなたの進捗</span>
            <span className="cm-mono" style={{ color: "var(--text-3)" }}>
              {done}/{total} 完了
            </span>
          </div>
          <div className="cm-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-7">
          <Stat value={`${pct}`} unit="%" label="完走率" />
          <Stat value={`${total}`} label="レッスン" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <div>
      <div
        className="font-semibold text-[22px] tracking-tight"
        style={{ fontFamily: "var(--font-mono-family)" }}
      >
        {value}
        {unit ? (
          <span className="text-[14px]" style={{ color: "var(--text-3)" }}>
            {unit}
          </span>
        ) : null}
      </div>
      <div className="text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--text-4)" }}>
        {label}
      </div>
    </div>
  );
}
