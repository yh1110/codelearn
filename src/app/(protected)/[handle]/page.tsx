import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { bookmarksUrl } from "@/lib/routes";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getMyCollections } from "@/services/collectionService";
import { getPublishedCourses } from "@/services/courseService";
import { getProfileByHandle } from "@/services/profileService";
import {
  getCompletedLessonIdsByUser,
  getCompletedProblemIdsByUser,
} from "@/services/progressService";
import { Heatmap } from "./_components/Heatmap";
import { MyCollectionsSection } from "./_components/MyCollectionsSection";
import { ProfileHero } from "./_components/ProfileHero";
import { ProfileOwnerActions } from "./_components/ProfileOwnerActions";
import { StatsGrid } from "./_components/StatsGrid";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: PageProps<"/[handle]">) {
  const session = await requireAuth();
  const { handle } = await params;

  const viewedProfile = await getProfileByHandle(handle);
  if (!viewedProfile) notFound();

  const isOwner = session.profile.id === viewedProfile.id;
  const displayName = viewedProfile.name ?? viewedProfile.handle;
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  // Stats are scoped to viewedProfile.id for both owner and visitor; bookmarks
  // are owner-only because the bookmark namespace is private (Layer A guard).
  const [collections, allCourses, completedLessons, completedProblems, bookmarks] =
    await Promise.all([
      getMyCollections(viewedProfile.id),
      getPublishedCourses(),
      getCompletedLessonIdsByUser(viewedProfile.id),
      getCompletedProblemIdsByUser(viewedProfile.id),
      isOwner ? getUserBookmarks(viewedProfile.id) : Promise.resolve(null),
    ]);

  const acCount = completedLessons.length + completedProblems.length;
  const totalLessonsAvailable = allCourses.reduce((acc, c) => acc + c.lessons.length, 0);
  const publishedCount = collections.filter((c) => c.isPublished).length;
  const createdCount = isOwner ? collections.length : publishedCount;
  const bookmarkCount = bookmarks
    ? bookmarks.courses.length +
      bookmarks.lessons.length +
      bookmarks.collections.length +
      bookmarks.problems.length
    : 0;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <ProfileHero
        displayName={displayName}
        handle={viewedProfile.handle}
        initial={initial}
        bio={viewedProfile.bio}
        actions={isOwner ? <ProfileOwnerActions /> : null}
      />

      <StatsGrid
        acCount={acCount}
        totalLessonsAvailable={totalLessonsAvailable}
        createdCount={createdCount}
        publishedCount={publishedCount}
        bookmarks={
          isOwner ? { count: bookmarkCount, href: bookmarksUrl(viewedProfile.handle) } : undefined
        }
      />

      {isOwner ? (
        <section className="mb-7">
          <div className="mb-4">
            <h2 className="m-0 font-semibold text-[18px] tracking-tight">学習ヒートマップ</h2>
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              過去52週間の活動 (準備中)
            </span>
          </div>
          <Heatmap />
        </section>
      ) : null}

      <MyCollectionsSection
        author={{ handle: viewedProfile.handle }}
        collections={collections}
        isOwner={isOwner}
      />
    </div>
  );
}
