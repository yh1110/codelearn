import { requireAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getCoursesWithLessons, getMyCourses } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";
import { Heatmap } from "./_components/Heatmap";
import { MyCoursesSection } from "./_components/MyCoursesSection";
import { ProfileHero } from "./_components/ProfileHero";
import { StatsGrid } from "./_components/StatsGrid";

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
      <ProfileHero
        displayName={displayName}
        handle={handle}
        email={session.email}
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

      <MyCoursesSection myCourses={myCourses} />
    </div>
  );
}
