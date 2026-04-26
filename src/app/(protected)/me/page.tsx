import { requireAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getMyCollections } from "@/services/collectionService";
import { getPublishedCourses } from "@/services/courseService";
import {
  getCompletedLessonIdsByUser,
  getCompletedProblemIdsByUser,
} from "@/services/progressService";
import { Heatmap } from "./_components/Heatmap";
import { MyCollectionsSection } from "./_components/MyCollectionsSection";
import { ProfileHero } from "./_components/ProfileHero";
import { StatsGrid } from "./_components/StatsGrid";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.profile.handle;
  const handle = session.profile.handle;
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  const [myCollections, allCourses, completedLessons, completedProblems, bookmarks] =
    await Promise.all([
      getMyCollections(session.userId),
      getPublishedCourses(),
      getCompletedLessonIdsByUser(session.userId),
      getCompletedProblemIdsByUser(session.userId),
      getUserBookmarks(session.userId),
    ]);

  const acCount = completedLessons.length + completedProblems.length;
  const totalLessonsAvailable = allCourses.reduce((acc, c) => acc + c.lessons.length, 0);
  const createdCount = myCollections.length;
  const publishedCount = myCollections.filter((c) => c.isPublished).length;
  const bookmarkCount =
    bookmarks.courses.length +
    bookmarks.lessons.length +
    bookmarks.collections.length +
    bookmarks.problems.length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <ProfileHero
        displayName={displayName}
        handle={handle}
        initial={initial}
        bio={session.profile.bio}
      />

      <StatsGrid
        acCount={acCount}
        totalLessonsAvailable={totalLessonsAvailable}
        createdCount={createdCount}
        publishedCount={publishedCount}
        bookmarkCount={bookmarkCount}
      />

      <section className="mb-7">
        <div className="mb-4">
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">学習ヒートマップ</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            過去52週間の活動 (準備中)
          </span>
        </div>
        <Heatmap />
      </section>

      <MyCollectionsSection myCollections={myCollections} />
    </div>
  );
}
