import { requireAuth } from "@/lib/auth";
import {
  getCommunityPublishedCoursesByNewest,
  getOfficialPublishedCourses,
} from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";
import { CourseCard } from "./_components/CourseCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await requireAuth();
  const [official, community, completed] = await Promise.all([
    getOfficialPublishedCourses(),
    getCommunityPublishedCoursesByNewest(),
    getCompletedLessonIdsByUser(session.userId),
  ]);

  const completedIds = new Set(completed);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <section>
        <div className="mb-4">
          <h1 className="m-0 font-semibold text-[22px] tracking-tight">公式コース</h1>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            codelearn が提供する TypeScript コース
          </span>
        </div>

        {official.length === 0 ? (
          <EmptyCourses variant="official" />
        ) : (
          <CourseGrid>
            {official.map((c, idx) => (
              <li key={c.id}>
                <CourseCard course={c} index={idx} completedIds={completedIds} />
              </li>
            ))}
          </CourseGrid>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4">
          <h2 className="m-0 font-semibold text-[22px] tracking-tight">コミュニティコース</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            ユーザーが投稿した新着コース
          </span>
        </div>

        {community.length === 0 ? (
          <EmptyCourses variant="community" />
        ) : (
          <CourseGrid>
            {community.map((c, idx) => (
              <li key={c.id}>
                <CourseCard course={c} index={idx} completedIds={completedIds} />
              </li>
            ))}
          </CourseGrid>
        )}
      </section>
    </div>
  );
}

function CourseGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {children}
    </ul>
  );
}

function EmptyCourses({ variant }: { variant: "official" | "community" }) {
  if (variant === "official") {
    return (
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
    );
  }
  return (
    <div
      className="rounded-[14px] px-8 py-12 text-center text-[13px]"
      style={{
        background: "var(--bg-1)",
        border: "1px dashed var(--line-3)",
        color: "var(--text-3)",
      }}
    >
      コミュニティコースはまだ投稿されていません。
    </div>
  );
}
