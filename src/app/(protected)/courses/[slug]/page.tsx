import { ArrowLeft, BookText, Play, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { getCourseBySlug } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const dynamic = "force-dynamic";

function statusClass(state: "ac" | "try" | "none") {
  if (state === "ac") return "cm-status-ac";
  if (state === "try") return "cm-status-try";
  return "cm-status-none";
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const session = await requireAuth();
  const { slug } = await params;

  let course: Awaited<ReturnType<typeof getCourseBySlug>>;
  try {
    course = await getCourseBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const completed = await getCompletedLessonIdsByUser(
    session.userId,
    course.lessons.map((l) => l.id),
  );
  const completedIds = new Set(completed);
  const done = course.lessons.filter((l) => completedIds.has(l.id)).length;
  const total = course.lessons.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const firstLesson = course.lessons[0];

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[13px]"
        style={{ color: "var(--text-3)" }}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> コース一覧
      </Link>

      {/* Hero */}
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <Star className="size-3.5" aria-hidden="true" /> お気に入り
            </button>
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

      {/* Lesson list */}
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">Lessons</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            順番に取り組むのがおすすめ
          </span>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[14px]"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <div
          className="grid items-center gap-4 border-b px-5 py-2.5"
          style={{
            gridTemplateColumns: "40px 24px 1fr 120px",
            background: "var(--bg-2)",
            borderColor: "var(--line-1)",
            color: "var(--text-4)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>#</span>
          <span />
          <span>Title</span>
          <span>Difficulty</span>
        </div>

        {course.lessons.map((l, i) => {
          const state: "ac" | "none" = completedIds.has(l.id) ? "ac" : "none";
          return (
            <Link
              key={l.id}
              href={`/courses/${course.slug}/lessons/${l.slug}`}
              className="grid cursor-pointer items-center gap-4 border-b px-5 py-3.5 transition last:border-b-0 hover:bg-[var(--bg-2)]"
              style={{
                gridTemplateColumns: "40px 24px 1fr 120px",
                borderColor: "var(--line-1)",
              }}
            >
              <span className="cm-mono" style={{ color: "var(--text-4)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                role="img"
                aria-label={state === "ac" ? "クリア済み" : "未着手"}
                title={state === "ac" ? "クリア済み" : "未着手"}
                className={cn("cm-status-dot", statusClass(state))}
              />
              <div>
                <div className="font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
                  {l.title}
                </div>
                <div
                  className="mt-0.5 inline-flex items-center gap-1 text-[12px]"
                  style={{ color: "var(--text-3)" }}
                >
                  <BookText className="size-3" aria-hidden="true" />
                  レッスン {i + 1}
                </div>
              </div>
              <span>
                <span className="cm-diff-badge cm-diff-1">初級</span>
              </span>
            </Link>
          );
        })}

        {course.lessons.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            このコースにはまだレッスンがありません。
          </div>
        ) : null}
      </div>
    </div>
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
