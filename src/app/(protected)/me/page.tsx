import { CheckCircle2, LogOut, Pencil, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getCoursesWithLessons, getMyCourses } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.email ?? session.userId;
  const handle =
    session.profile.username ?? (session.email ? session.email.split("@")[0] : session.userId);
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  const [myCourses, allCourses, completedIds, bookmarks] = await Promise.all([
    getMyCourses(session.userId),
    getCoursesWithLessons(),
    getCompletedLessonIdsByUser(session.userId),
    getUserBookmarks(session.userId),
  ]);

  const acCount = completedIds.length;
  const totalLessonsAvailable = allCourses.reduce((acc, c) => acc + c.lessons.length, 0);
  const createdCount = myCourses.length;
  const publishedCount = myCourses.filter((c) => c.isPublished).length;
  const bookmarkCount = bookmarks.courses.length + bookmarks.lessons.length;

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
            {session.profile.bio ? (
              <p
                className="mt-2 max-w-prose whitespace-pre-wrap text-[13px] leading-relaxed"
                style={{ color: "var(--text-2)" }}
              >
                {session.profile.bio}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/me/edit"
              className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] transition hover:bg-[var(--bg-3)]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <Pencil className="size-3.5" aria-hidden="true" /> プロフィールを編集
            </Link>
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
        <Link
          href="/bookmarks"
          className="rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <div
            className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "var(--text-4)", fontWeight: 600 }}
          >
            <Star className="size-3.5" aria-hidden="true" />
            お気に入り
          </div>
          <div
            className="font-semibold text-[28px] tracking-tight"
            style={{ fontFamily: "var(--font-mono-family)" }}
          >
            {bookmarkCount}
          </div>
          <div className="mt-1 font-mono text-[11.5px]" style={{ color: "var(--text-3)" }}>
            一覧を見る →
          </div>
        </Link>
      </div>

      {/* Learning heatmap (placeholder) */}
      <section className="mb-7">
        <div className="mb-4">
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">学習ヒートマップ</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            過去52週間の活動 (準備中)
          </span>
        </div>
        <Heatmap />
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

const HEATMAP_WEEKS = 52;
const HEATMAP_DAYS = 7;
const HEATMAP_CELL_SIZE = 13;
const HEATMAP_CELL_GAP = 4;
const MONTH_LABELS_JA = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function buildMonthLabels(weekCount = HEATMAP_WEEKS) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  // Treat Monday as start of week. getDay(): Sun=0..Sat=6 → offset to Monday.
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() + offsetToMonday);
  const firstMonday = new Date(lastMonday);
  firstMonday.setDate(lastMonday.getDate() - (weekCount - 1) * 7);

  const labels: { colIndex: number; month: number }[] = [];
  let prevMonth = -1;
  for (let w = 0; w < weekCount; w++) {
    const firstDay = new Date(firstMonday);
    firstDay.setDate(firstMonday.getDate() + w * 7);
    const month = firstDay.getMonth();
    if (month !== prevMonth) {
      // Keep labels at least 2 columns apart to avoid visual crowding.
      if (w === 0 || w - (labels.at(-1)?.colIndex ?? -2) >= 2) {
        labels.push({ colIndex: w, month });
      }
      prevMonth = month;
    }
  }
  return labels;
}

function Heatmap() {
  const monthLabels = buildMonthLabels();
  const totalCells = HEATMAP_WEEKS * HEATMAP_DAYS;
  const cellStride = HEATMAP_CELL_SIZE + HEATMAP_CELL_GAP;
  const gridWidth = HEATMAP_WEEKS * HEATMAP_CELL_SIZE + (HEATMAP_WEEKS - 1) * HEATMAP_CELL_GAP;
  // Rows (Mon-Sun). Show labels only on Mon/Wed/Fri (rows 0/2/4) to avoid crowding.
  const weekdayLabels = ["月", "", "水", "", "金", "", ""];

  return (
    <div
      className="overflow-x-auto rounded-[14px]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className="p-4" style={{ width: "max-content" }}>
        {/* Month label row */}
        <div className="flex" style={{ marginLeft: 24 }}>
          <div
            className="relative text-[11px]"
            style={{ width: gridWidth, height: 16, color: "var(--text-4)" }}
          >
            {monthLabels.map((ml) => (
              <span
                key={`${ml.colIndex}-${ml.month}`}
                className="absolute top-0 font-mono"
                style={{ left: ml.colIndex * cellStride }}
              >
                {MONTH_LABELS_JA[ml.month]}
              </span>
            ))}
          </div>
        </div>

        {/* Weekday labels + cells */}
        <div className="flex items-start">
          <div
            className="grid font-mono text-[11px]"
            style={{
              width: 24,
              gridTemplateRows: `repeat(${HEATMAP_DAYS}, ${HEATMAP_CELL_SIZE}px)`,
              rowGap: HEATMAP_CELL_GAP,
              color: "var(--text-4)",
            }}
          >
            {weekdayLabels.map((label, idx) => (
              <span
                key={`wd-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: weekday labels are static positional
                  idx
                }`}
                className="flex items-center leading-none"
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid"
            style={{
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(${HEATMAP_DAYS}, ${HEATMAP_CELL_SIZE}px)`,
              gridAutoColumns: `${HEATMAP_CELL_SIZE}px`,
              gap: HEATMAP_CELL_GAP,
            }}
          >
            {Array.from({ length: totalCells }, (_, i) => `cell-${i}`).map((id) => (
              <div key={id} className="cm-heat-cell" />
            ))}
          </div>
        </div>
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
