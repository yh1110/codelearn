import { requireAuth } from "@/lib/auth";
import { getPublishedCourses } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";
import { CourseCard } from "../_components/CourseCard";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const session = await requireAuth();
  const [courses, completedLessons] = await Promise.all([
    getPublishedCourses(),
    getCompletedLessonIdsByUser(session.userId),
  ]);
  const completedIds = new Set(completedLessons);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">学ぶ — 公式コース</h1>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          codelearn が提供する TypeScript の学習路線
        </p>
      </header>

      {courses.length === 0 ? (
        <div
          className="rounded-[14px] px-8 py-12 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          公式コースがまだありません。
          <code
            className="mx-1 rounded px-2 py-0.5 text-[12px]"
            style={{ background: "var(--bg-2)", color: "var(--accent-solid)" }}
          >
            npm run db:seed
          </code>
          を実行してください。
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {courses.map((c, idx) => (
            <li key={c.id}>
              <CourseCard course={c} index={idx} completedIds={completedIds} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
