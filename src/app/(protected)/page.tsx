import { requireAuth } from "@/lib/auth";
import { getCoursesWithLessons } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";
import { BrowseFilterPanel } from "./_components/BrowseFilterPanel";
import { BrowseToolbar, type SortOption } from "./_components/BrowseToolbar";
import { CourseCard } from "./_components/CourseCard";

export const dynamic = "force-dynamic";

const LEARN_SORT_OPTIONS: ReadonlyArray<SortOption> = [
  { key: "recommended", label: "おすすめ" },
  { key: "newest", label: "新着" },
  { key: "popular", label: "人気" },
  { key: "ac-rate", label: "AC率高" },
];

export default async function Home() {
  const session = await requireAuth();
  const [courses, completed] = await Promise.all([
    getCoursesWithLessons(),
    getCompletedLessonIdsByUser(session.userId),
  ]);

  const completedIds = new Set(completed);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">学ぶ — キュレーションコース</h1>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          公式が厳選した TypeScript の学習コース
        </p>
      </header>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-[240px_minmax(0,1fr)]">
        <BrowseFilterPanel ariaLabel="フィルタ (学ぶ / UI プレビュー)" />
        <main className="min-w-0">
          <BrowseToolbar
            total={courses.length}
            sortOptions={LEARN_SORT_OPTIONS}
            activeSortKey="recommended"
          />
          {courses.length === 0 ? (
            <EmptyCourses />
          ) : (
            <ul
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {courses.map((course, idx) => (
                <li key={course.id}>
                  <CourseCard course={course} index={idx} completedIds={completedIds} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
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
