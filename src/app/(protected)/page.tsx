import { BookText } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getCoursesWithLessons } from "@/services/courseService";
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
  const chars = Array.from(trimmed);
  return chars.slice(0, 2).join("").toUpperCase();
}

export default async function Home() {
  const session = await requireAuth();
  const [courses, completed] = await Promise.all([
    getCoursesWithLessons(),
    getCompletedLessonIdsByUser(session.userId),
  ]);

  const completedIds = new Set(completed);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <section>
        <div className="mb-4">
          <h1 className="m-0 font-semibold text-[22px] tracking-tight">コース一覧</h1>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            公開されている TypeScript コース
          </span>
        </div>

        {courses.length === 0 ? (
          <EmptyCourses />
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
      </section>
    </div>
  );
}

function EmptyCourses() {
  return (
    <div
      className="rounded-[14px] px-8 py-12 text-center text-[13px]"
      style={{
        background: "var(--bg-1)",
        border: "1px dashed var(--line-3)",
        color: "var(--text-3)",
      }}
    >
      まだコースがありません。
      <code
        className="mx-1 rounded px-2 py-0.5 text-[12px]"
        style={{ background: "var(--bg-2)", color: "var(--accent-solid)" }}
      >
        npm run db:seed
      </code>
      を実行してください。
    </div>
  );
}
