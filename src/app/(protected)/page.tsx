import { ArrowRight, BookText, CheckCircle2, Plus } from "lucide-react";
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
  const totalDone = courses.reduce(
    (acc, c) => acc + c.lessons.filter((l) => completedIds.has(l.id)).length,
    0,
  );
  const firstName = (session.profile.name ?? session.email ?? "学習者").split(/[\s@]/)[0];

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      {/* Hero */}
      <section
        className="cm-grain relative overflow-hidden rounded-[20px] p-7"
        style={{
          background: "linear-gradient(135deg, var(--bg-1), var(--bg-2))",
          border: "1px solid var(--line-1)",
          isolation: "isolate",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: "-80px -80px auto auto",
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, oklch(0.78 var(--accent-c) var(--accent-h) / 0.35), transparent 65%)",
            filter: "blur(30px)",
            zIndex: 0,
          }}
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="cm-label mb-1">ようこそ</div>
            <h1 className="m-0 font-semibold text-[22px] tracking-tight">
              おかえりなさい、{firstName}さん
            </h1>
            <p className="mt-2 text-[13px]" style={{ color: "var(--text-3)" }}>
              ブラウザで TypeScript を学ぶ。手を動かしながら進めよう。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="cm-chip cm-chip-accent">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {totalDone} クリア
            </span>
            <Link
              href="/dashboard/courses/new"
              className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2 font-semibold text-[13px] transition"
              style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              コースを作る
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="m-0 font-semibold text-[18px] tracking-tight">コース一覧</h2>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              公開されている TypeScript コース
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[13px] transition hover:text-[var(--accent-solid)]"
            style={{ color: "var(--text-2)" }}
          >
            管理 <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
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
