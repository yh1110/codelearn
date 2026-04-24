import { Plus } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getMyCourses } from "@/services/courseService";
import { CourseListItem } from "./_components/CourseListItem";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const courses = await getMyCourses(session.userId);

  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.length - publishedCount;
  const totalLessons = courses.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-semibold text-[24px] tracking-tight">あなたのコース</h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
            コースを作って、学びたい人のためのレッスンを公開しよう。
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2 font-semibold text-[13px] transition"
          style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
        >
          <Plus className="size-3.5" aria-hidden="true" /> 新しいコース
        </Link>
      </header>

      <div className="mb-7 grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <StatBox k="公開中" v={String(publishedCount)} />
        <StatBox k="下書き" v={String(draftCount)} />
        <StatBox k="総レッスン数" v={String(totalLessons)} />
      </div>

      {courses.length === 0 ? (
        <div
          className="rounded-[14px] px-8 py-14 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          <div className="mb-2">まだコースがありません。</div>
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-1.5 text-[13px]"
            style={{ color: "var(--accent-solid)" }}
          >
            <Plus className="size-3.5" aria-hidden="true" /> 最初のコースを作成する
          </Link>
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {courses.map((c) => (
            <li key={c.id}>
              <CourseListItem
                course={{
                  id: c.id,
                  slug: c.slug,
                  title: c.title,
                  description: c.description,
                  isPublished: c.isPublished,
                  lessonCount: c.lessons.length,
                }}
              />
            </li>
          ))}
          <li>
            <Link
              href="/dashboard/courses/new"
              className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-[14px] p-4 text-center text-[13px] transition hover:border-[color:var(--accent-line)] hover:text-[var(--accent-solid)]"
              style={{
                border: "1px dashed var(--line-3)",
                background: "transparent",
                color: "var(--text-3)",
              }}
            >
              <Plus className="size-7" aria-hidden="true" />
              <div>新しいコース</div>
              <div className="text-[11px]" style={{ color: "var(--text-4)" }}>
                ゼロから作る
              </div>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

function StatBox({ k, v }: { k: string; v: string }) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className="cm-label mb-1.5">{k}</div>
      <div
        className="font-semibold text-[28px] tracking-tight"
        style={{ fontFamily: "var(--font-mono-family)" }}
      >
        {v}
      </div>
    </div>
  );
}
