import { Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { getProfileByHandle } from "@/services/profileService";
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
  const session = await requireAuth();
  const { handle } = await params;
  const sp = await searchParams;
  const activeTab = parseBookmarkTab(sp?.tab);

  const viewedProfile = await getProfileByHandle(handle);
  if (!viewedProfile) notFound();

  // Bookmarks are private until a public/private toggle ships. Reject any
  // viewer that is not the owner with a 404 (rather than 403) so the existence
  // of the list does not leak — Layer A guard from the issue #72 spec.
  const isOwner = session.profile.id === viewedProfile.id;
  if (!isOwner) notFound();

  // The bookmark service queries WHERE userId = viewedProfile.id, so even if
  // a future change loosened the isOwner gate above, the data fetch itself
  // would still be scoped to one user — Layer C defence in depth.
  const { courses, lessons, collections, problems } = await getUserBookmarks(viewedProfile.id);
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
                <BookmarkCourseList courses={courses} />
                <BookmarkLessonList lessons={lessons} />
              </>
            )
          ) : communityCount === 0 ? (
            <EmptyTab message="コミュニティのお気に入りはまだありません。" />
          ) : (
            <>
              <BookmarkCollectionList collections={collections} />
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
