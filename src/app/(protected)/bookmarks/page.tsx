import { BookText, Star } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getUserBookmarks } from "@/services/bookmarkService";

export const dynamic = "force-dynamic";

const COVER_VARIANTS = [
  "cm-cover-1",
  "cm-cover-2",
  "cm-cover-3",
  "cm-cover-4",
  "cm-cover-5",
  "cm-cover-6",
] as const;

function coverFor(index: number) {
  return COVER_VARIANTS[index % COVER_VARIANTS.length];
}

function glyphFor(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return "TS";
  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}

export default async function BookmarksPage() {
  const session = await requireAuth();
  const { courses, lessons } = await getUserBookmarks(session.userId);

  const total = courses.length + lessons.length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <div className="inline-flex items-center gap-2">
          <Star className="size-4" aria-hidden="true" style={{ color: "var(--accent-solid)" }} />
          <h1 className="m-0 font-bold text-[26px] tracking-tight">お気に入り</h1>
        </div>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          コースとレッスンの Star を集めた一覧
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
            コースを探す →
          </Link>
        </div>
      ) : null}

      {courses.length > 0 ? (
        <section className="mb-9">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="m-0 font-semibold text-[18px] tracking-tight">コース</h2>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {courses.length} 件
              </span>
            </div>
          </div>
          <ul
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
          >
            {courses.map((b, idx) => (
              <li key={b.id}>
                <CourseBookmarkCard
                  slug={b.course.slug}
                  title={b.course.title}
                  description={b.course.description}
                  index={idx}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {lessons.length > 0 ? (
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="m-0 font-semibold text-[18px] tracking-tight">レッスン</h2>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                {lessons.length} 件
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5">
            {lessons.map((b) => (
              <li key={b.id}>
                <LessonBookmarkRow
                  courseSlug={b.lesson.course.slug}
                  courseTitle={b.lesson.course.title}
                  lessonSlug={b.lesson.slug}
                  lessonTitle={b.lesson.title}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CourseBookmarkCard({
  slug,
  title,
  description,
  index,
}: {
  slug: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <Link
      href={`/courses/${slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[14px] transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
      )}
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className={cn("cm-cover", coverFor(index))}>
        <span className="cm-cover-glyph" aria-hidden="true">
          {glyphFor(title)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {title}
        </h3>
        {description ? (
          <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function LessonBookmarkRow({
  courseSlug,
  courseTitle,
  lessonSlug,
  lessonTitle,
}: {
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
}) {
  return (
    <Link
      href={`/courses/${courseSlug}/lessons/${lessonSlug}`}
      className="flex items-center gap-3 rounded-[12px] px-4 py-3 transition hover:bg-[var(--bg-2)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <BookText className="size-3.5" aria-hidden="true" style={{ color: "var(--text-3)" }} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
          {lessonTitle}
        </div>
        <div className="mt-0.5 truncate text-[12px]" style={{ color: "var(--text-3)" }}>
          {courseTitle}
        </div>
      </div>
    </Link>
  );
}
