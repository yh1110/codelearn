import { Star } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOptionalAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getProfileByHandle } from "@/services/profileService";
import {
  getCompletedLessonIdsByUser,
  getCompletedProblemIdsByUser,
} from "@/services/progressService";
import { BookmarkCollectionList } from "./_components/BookmarkCollectionList";
import { BookmarkCourseList } from "./_components/BookmarkCourseList";
import { BookmarkLessonList } from "./_components/BookmarkLessonList";
import { BookmarkProblemList } from "./_components/BookmarkProblemList";
import { BookmarksTabs, parseBookmarkTab } from "./_components/BookmarksTabs";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({
  params,
  searchParams,
}: PageProps<"/[handle]/bookmarks">) {
  const session = await getOptionalAuth();
  if (!session) {
    const { handle } = await params;
    redirect(`/login?from=/${handle}/bookmarks`);
  }

  const { handle } = await params;
  const sp = await searchParams;
  const activeTab = parseBookmarkTab(sp?.tab);

  const viewedProfile = await getProfileByHandle(handle);
  if (!viewedProfile) notFound();

  const isOwner = session.profile.id === viewedProfile.id;
  if (!isOwner) notFound();

  const [bookmarks, completedLessonIds, completedProblemIds] = await Promise.all([
    getUserBookmarks(viewedProfile.id),
    getCompletedLessonIdsByUser(viewedProfile.id),
    getCompletedProblemIdsByUser(viewedProfile.id),
  ]);
  const { courses, lessons, collections, problems } = bookmarks;
  const completedLessonIdSet = new Set(completedLessonIds);
  const completedProblemIdSet = new Set(completedProblemIds);
  const officialCount = courses.length + lessons.length;
  const communityCount = collections.length + problems.length;
  const total = officialCount + communityCount;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <div className="inline-flex items-center gap-2">
          <Star className="size-4" aria-hidden="true" style={{ color: "var(--accent-solid)" }} />
          <h1 className="m-0 font-bold text-[26px] tracking-tight">お気に入り</h1>
        </div>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          公式コンテンツとコミュニティの Star を分けて表示します
        </p>
      </header>

      {total === 0 ? (
        <div
          className="rounded-[14px] px-8 py-14 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          まだお気に入りはありません。
          <Link href="/" className="ml-1 text-[13px]" style={{ color: "var(--accent-solid)" }}>
            コレクションを探す →
          </Link>
        </div>
      ) : (
        <>
          <BookmarksTabs
            handle={viewedProfile.handle}
            active={activeTab}
            officialCount={officialCount}
            communityCount={communityCount}
          />
          {activeTab === "official" ? (
            officialCount === 0 ? (
              <EmptyTab message="公式コンテンツのお気に入りはまだありません。" />
            ) : (
              <>
                <BookmarkCourseList courses={courses} completedLessonIds={completedLessonIdSet} />
                <BookmarkLessonList lessons={lessons} />
              </>
            )
          ) : communityCount === 0 ? (
            <EmptyTab message="コミュニティのお気に入りはまだありません。" />
          ) : (
            <>
              <BookmarkCollectionList
                collections={collections}
                completedProblemIds={completedProblemIdSet}
              />
              <BookmarkProblemList problems={problems} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div
      className="rounded-[14px] px-8 py-12 text-center text-[13px]"
      style={{
        background: "var(--bg-1)",
        border: "1px dashed var(--line-3)",
        color: "var(--text-3)",
      }}
    >
      {message}
    </div>
  );
}
