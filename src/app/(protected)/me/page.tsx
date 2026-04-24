import { CheckCircle2, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getCoursesWithLessons, getMyCourses } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.email ?? session.userId;
  const handle = session.email ? session.email.split("@")[0] : session.userId;
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  const [myCourses, allCourses, completedIds] = await Promise.all([
    getMyCourses(session.userId),
    getCoursesWithLessons(),
    getCompletedLessonIdsByUser(session.userId),
  ]);

  const acCount = completedIds.length;
  const totalLessonsAvailable = allCourses.reduce((acc, c) => acc + c.lessons.length, 0);
  const createdCount = myCourses.length;
  const publishedCount = myCourses.filter((c) => c.isPublished).length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      {/* Profile hero */}
      <section
        className="relative mb-7 overflow-hidden rounded-[20px] p-7"
        style={{
          background: "var(--bg-1)",
          border: "1px solid var(--line-1)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.32 0.10 var(--accent-h)), oklch(0.22 0.04 220))",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background: "linear-gradient(180deg, transparent, var(--bg-1) 100%)",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div className="cm-avatar cm-avatar-xl" aria-hidden="true">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 font-bold text-[26px] tracking-tight">{displayName}</h1>
            <div className="mt-1 font-mono text-[13px]" style={{ color: "var(--text-3)" }}>
              @{handle}
            </div>
            {session.email ? (
              <div className="mt-1 text-[12.5px]" style={{ color: "var(--text-3)" }}>
                {session.email}
              </div>
            ) : null}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] transition hover:bg-[var(--bg-3)]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <LogOut className="size-3.5" aria-hidden="true" /> サインアウト
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <div
        className="mb-7 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <Stat
          icon={<CheckCircle2 className="size-3.5" aria-hidden="true" />}
          label="クリア済みレッスン"
          value={String(acCount)}
          sub={totalLessonsAvailable > 0 ? `${totalLessonsAvailable} 中` : undefined}
        />
        <Stat
          icon={<Sparkles className="size-3.5" aria-hidden="true" />}
          label="作成したコース"
          value={String(createdCount)}
          sub={`${publishedCount} 公開中`}
        />
      </div>

      {/* Learning heatmap (placeholder) */}
      <section className="mb-7">
        <div className="mb-4">
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">学習ヒートマップ</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            過去52週間の活動 (準備中)
          </span>
        </div>
        <div
          className="overflow-x-auto rounded-[14px]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <div
            className="grid gap-[3px] p-4"
            style={{
              gridAutoFlow: "column",
              gridTemplateRows: "repeat(7, 10px)",
              width: "max-content",
            }}
          >
            {Array.from({ length: 7 * 52 }, (_, i) => `cell-${i}`).map((id) => (
              <div key={id} className="cm-heat-cell" />
            ))}
          </div>
          <div
            className="flex items-center justify-between border-t px-4 py-2.5 text-[12px]"
            style={{ borderColor: "var(--line-1)", color: "var(--text-3)" }}
          >
            <span>活動データは近日公開</span>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-4)" }}>
              少ない
              <span className="cm-heat-cell" />
              <span className="cm-heat-cell cm-heat-1" />
              <span className="cm-heat-cell cm-heat-2" />
              <span className="cm-heat-cell cm-heat-3" />
              <span className="cm-heat-cell cm-heat-4" />
              多い
            </div>
          </div>
        </div>
      </section>

      {/* My courses */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h2 className="m-0 font-semibold text-[18px] tracking-tight">作成したコース</h2>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              あなたが作者として公開 / 管理しているコース
            </span>
          </div>
          <Link href="/dashboard" className="text-[13px]" style={{ color: "var(--accent-solid)" }}>
            管理する →
          </Link>
        </div>
        {myCourses.length === 0 ? (
          <div
            className="rounded-[14px] px-6 py-10 text-center text-[13px]"
            style={{
              background: "var(--bg-1)",
              border: "1px dashed var(--line-3)",
              color: "var(--text-3)",
            }}
          >
            まだコースを作成していません。
            <Link
              href="/dashboard/courses/new"
              className="ml-1 text-[13px]"
              style={{ color: "var(--accent-solid)" }}
            >
              最初のコースを作る
            </Link>
          </div>
        ) : (
          <ul
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {myCourses.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/courses/${c.id}`}
                  className="flex h-full flex-col gap-2 rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
                  style={{
                    background: "var(--bg-1)",
                    border: "1px solid var(--line-1)",
                    minHeight: 140,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="m-0 font-semibold text-[14.5px] leading-snug tracking-tight"
                      style={{ color: "var(--text-1)" }}
                    >
                      {c.title}
                    </h3>
                    <span
                      className={`cm-status-pill ${
                        c.isPublished ? "cm-status-pill-pub" : "cm-status-pill-draft"
                      }`}
                    >
                      {c.isPublished ? "公開中" : "下書き"}
                    </span>
                  </div>
                  {c.description ? (
                    <p
                      className="m-0 line-clamp-2 text-[12.5px]"
                      style={{ color: "var(--text-3)" }}
                    >
                      {c.description}
                    </p>
                  ) : null}
                  <div
                    className="mt-auto flex items-center gap-3 border-t pt-2.5 font-mono text-[12px]"
                    style={{
                      borderColor: "var(--line-1)",
                      color: "var(--text-3)",
                    }}
                  >
                    <span>
                      レッスン <b style={{ color: "var(--text-1)" }}>{c.lessons.length}</b>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  sub,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div
        className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--text-4)", fontWeight: 600 }}
      >
        {icon}
        {label}
      </div>
      <div
        className="font-semibold text-[28px] tracking-tight"
        style={{ fontFamily: "var(--font-mono-family)" }}
      >
        {value}
        {unit ? (
          <span className="text-[14px]" style={{ color: "var(--text-3)" }}>
            {unit}
          </span>
        ) : null}
      </div>
      {sub ? (
        <div className="mt-1 font-mono text-[11.5px]" style={{ color: "var(--text-3)" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}
