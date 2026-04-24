import { BookText, LayoutGrid, Rows3 } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { CourseAuthor } from "@/repositories";
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

const DIFFICULTY_FILTERS = [
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
] as const;

const TAG_FILTERS = ["TypeScript", "基礎", "型", "関数", "配列", "オブジェクト", "入門"] as const;

const LANGUAGE_FILTERS = [
  { key: "typescript", label: "TypeScript", active: true },
  { key: "javascript", label: "JavaScript", active: false },
  { key: "python", label: "Python", active: false },
] as const;

const SORT_OPTIONS = [
  { key: "newest", label: "新着" },
  { key: "popular", label: "人気" },
  { key: "ac-rate", label: "AC率高" },
  { key: "unchallenged", label: "未挑戦" },
] as const;

function coverFor(index: number) {
  return COVER_VARIANTS[index % COVER_VARIANTS.length];
}

function glyphFor(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "TS";
  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}

function authorLabel(author: CourseAuthor | null): string {
  if (!author) return "Anonymous";
  return author.name ?? (author.email ? author.email.split("@")[0] : "Anonymous");
}

function authorInitial(author: CourseAuthor | null): string {
  const label = authorLabel(author);
  return (Array.from(label.trim())[0] ?? "?").toUpperCase();
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
      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">Explore — コミュニティの問題集</h1>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          他のユーザーが作った Collection を探そう
        </p>
      </header>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-[240px_minmax(0,1fr)]">
        <FilterPanel />
        <ExploreMain courses={courses} completedIds={completedIds} />
      </div>
    </div>
  );
}

function FilterPanel() {
  return (
    <aside
      className="h-max rounded-[14px] p-4 md:sticky md:top-20"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-1)",
      }}
      aria-label="フィルタ (UI プレビュー)"
    >
      <FilterGroup title="難易度">
        <ul className="space-y-0.5">
          {DIFFICULTY_FILTERS.map((d) => (
            <li key={d.key}>
              <CheckRow label={d.label} count={0} />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="タグ">
        <div className="flex flex-wrap gap-1.5">
          {TAG_FILTERS.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="対応言語">
        <ul className="space-y-0.5">
          {LANGUAGE_FILTERS.map((l) => (
            <li key={l.key}>
              <CheckRow label={l.label} checked={l.active} />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center rounded-[6px] px-2.5 py-1.5 text-[12px] opacity-60"
        style={{ color: "var(--text-2)" }}
      >
        フィルタをクリア
      </button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h2
        className="m-0 mb-2 text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--text-4)", fontWeight: 600 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckRow({
  label,
  count,
  checked = false,
}: {
  label: string;
  count?: number;
  checked?: boolean;
}) {
  return (
    <label
      className="flex cursor-not-allowed items-center justify-between py-1 text-[13px] opacity-70"
      style={{ color: "var(--text-2)" }}
    >
      <span className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          disabled
          defaultChecked={checked}
          aria-disabled="true"
          className="cursor-not-allowed"
          style={{ accentColor: "var(--accent-solid)" }}
        />
        {label}
      </span>
      {typeof count === "number" ? (
        <span className="cm-mono" style={{ color: "var(--text-4)" }}>
          {count}
        </span>
      ) : null}
    </label>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span
      className="cursor-not-allowed rounded-[999px] border px-2.5 py-0.5 text-[12px] opacity-70"
      style={{
        background: "var(--bg-2)",
        borderColor: "var(--line-1)",
        color: "var(--text-2)",
      }}
      aria-disabled="true"
      role="presentation"
    >
      {label}
    </span>
  );
}

type ExploreCourse = Awaited<ReturnType<typeof getPublishedCoursesByNewest>>[number];

function ExploreMain({
  courses,
  completedIds,
}: {
  courses: ExploreCourse[];
  completedIds: Set<string>;
}) {
  return (
    <main className="min-w-0">
      <Toolbar total={courses.length} />
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
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
        >
          {courses.map((c, idx) => (
            <li key={c.id}>
              <ExploreCard course={c} index={idx} completedIds={completedIds} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Toolbar({ total }: { total: number }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="text-[13px]" style={{ color: "var(--text-3)" }}>
        <b style={{ color: "var(--text-1)" }}>{total}</b> / {total} 件
      </div>
      <div className="flex items-center gap-2">
        <fieldset className="cm-segment m-0 border-0 p-[3px]" disabled>
          <legend className="sr-only">並び替え (UI プレビュー)</legend>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-pressed={opt.key === "newest"}
              className="cursor-not-allowed"
            >
              {opt.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="cm-segment m-0 border-0 p-[3px]">
          <legend className="sr-only">表示切替 (UI プレビュー)</legend>
          <button type="button" aria-pressed="true" aria-label="グリッド表示">
            <LayoutGrid className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled
            aria-pressed="false"
            aria-label="リスト表示 (準備中)"
            className="cursor-not-allowed"
          >
            <Rows3 className="size-3.5" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </div>
  );
}

function ExploreCard({
  course,
  index,
  completedIds,
}: {
  course: ExploreCourse;
  index: number;
  completedIds: Set<string>;
}) {
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
