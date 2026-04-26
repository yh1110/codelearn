import { Star } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getUserBookmarks } from "@/services/bookmarkService";
import { BookmarkCollectionList } from "./_components/BookmarkCollectionList";
import { BookmarkCourseList } from "./_components/BookmarkCourseList";
import { BookmarkLessonList } from "./_components/BookmarkLessonList";
import { BookmarkProblemList } from "./_components/BookmarkProblemList";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const session = await requireAuth();
  const { courses, lessons, collections, problems } = await getUserBookmarks(session.userId);

  const total = courses.length + lessons.length + collections.length + problems.length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <div className="inline-flex items-center gap-2">
          <Star className="size-4" aria-hidden="true" style={{ color: "var(--accent-solid)" }} />
          <h1 className="m-0 font-bold text-[26px] tracking-tight">お気に入り</h1>
        </div>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          コース・レッスン・コレクション・問題の Star を集めた一覧
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
          <Link
            href="/explore"
            className="ml-1 text-[13px]"
            style={{ color: "var(--accent-solid)" }}
          >
            コレクションを探す →
          </Link>
        </div>
      ) : null}

      <BookmarkCourseList courses={courses} />
      <BookmarkLessonList lessons={lessons} />
      <BookmarkCollectionList collections={collections} />
      <BookmarkProblemList problems={problems} />
    </div>
  );
}
