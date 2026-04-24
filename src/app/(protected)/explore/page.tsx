import { BookText, Compass } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getPublishedCoursesByNewest } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const dynamic = "force-dynamic";

const COVER_VARIANTS = [
  "cm-cover-1",
  "cm-cover-2",
  "cm-cover-3",
  "cm-cover-4",
  "cm-cover-5",
  "cm-cover-6",
] as const;

function coverFor(index: number) {
  return COVER_VARIANTS[index % COVER_VARIANTS.length];
}

function glyphFor(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "TS";
  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}

export default async function ExplorePage() {
  const session = await requireAuth();
  const [courses, completed] = await Promise.all([
    getPublishedCoursesByNewest(),
    getCompletedLessonIdsByUser(session.userId),
  ]);

  const completedIds = new Set(completed);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="cm-label mb-1 inline-flex items-center gap-1.5">
            <Compass className="size-3" aria-hidden="true" /> 探す
          </div>
          <h1 className="m-0 font-semibold text-[24px] tracking-tight">新着コース</h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
            公開されたばかりのコースから順に表示しています。
          </p>
        </div>
        <div className="cm-mono text-[12px]" style={{ color: "var(--text-3)" }}>
          全 <b style={{ color: "var(--text-1)" }}>{courses.length}</b> 件
        </div>
      </header>

      {courses.length === 0 ? (
        <div
          className="rounded-[14px] px-8 py-14 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          公開されているコースがまだありません。
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {courses.map((c, idx) => {
            const total = c.lessons.length;
            const done = c.lessons.filter((l) => completedIds.has(l.id)).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <li key={c.id}>
                <Link
                  href={`/courses/${c.slug}`}
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-[14px] transition",
                    "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
                  )}
                  style={{
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-1)",
                  }}
                >
                  <div className={cn("cm-cover", coverFor(idx))}>
                    <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
                      <span className="cm-diff-badge cm-diff-1">初級</span>
                    </div>
                    <span className="cm-cover-glyph" aria-hidden="true">
                      {glyphFor(c.title)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-4">
                    <h3
                      className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
                      style={{ color: "var(--text-1)" }}
                    >
                      {c.title}
                    </h3>
                    {c.description ? (
                      <p
                        className="m-0 line-clamp-2 text-[12.5px]"
                        style={{ color: "var(--text-3)" }}
                      >
                        {c.description}
                      </p>
                    ) : null}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
