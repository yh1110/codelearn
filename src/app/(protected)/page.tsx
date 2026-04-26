import { requireAuth } from "@/lib/auth";
import { getPublishedCollectionsByNewest } from "@/services/collectionService";
import { getPublishedCourses } from "@/services/courseService";
import {
  getCompletedLessonIdsByUser,
  getCompletedProblemIdsByUser,
} from "@/services/progressService";
import { CollectionCard } from "./_components/CollectionCard";
import { CourseCard } from "./_components/CourseCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await requireAuth();
  const [official, community, completedLessons, completedProblems] = await Promise.all([
    getPublishedCourses(),
    getPublishedCollectionsByNewest(),
    getCompletedLessonIdsByUser(session.userId),
    getCompletedProblemIdsByUser(session.userId),
  ]);

  const completedLessonIds = new Set(completedLessons);
  const completedProblemIds = new Set(completedProblems);

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
          <EmptyState variant="official" />
        ) : (
          <CardGrid>
            {official.map((c, idx) => (
              <li key={c.id}>
                <CourseCard course={c} index={idx} completedIds={completedLessonIds} />
              </li>
            ))}
          </CardGrid>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4">
          <h2 className="m-0 font-semibold text-[22px] tracking-tight">コミュニティコレクション</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            ユーザーが投稿した新着の問題集
          </span>
        </div>

        {community.length === 0 ? (
          <EmptyState variant="community" />
        ) : (
          <CardGrid>
            {community.map((c, idx) => (
              <li key={c.id}>
                <CollectionCard collection={c} index={idx} completedIds={completedProblemIds} />
              </li>
            ))}
          </CardGrid>
        )}
      </section>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {children}
    </ul>
  );
}

function EmptyState({ variant }: { variant: "official" | "community" }) {
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
      コミュニティコレクションはまだ投稿されていません。
    </div>
  );
}
