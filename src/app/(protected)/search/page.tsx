import { BookText, FileText, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { MIN_QUERY_LENGTH } from "@/config/search";
import { requireAuth } from "@/lib/auth";
import type { CourseSearchHit, LessonSearchHit } from "@/repositories";
import { search } from "@/services/searchService";

export const dynamic = "force-dynamic";

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  await requireAuth();
  const sp = await searchParams;
  const rawQuery = firstParam(sp?.q);
  const { query, tooShort, courses, lessons } = await search(rawQuery);
  const hasQuery = query.length > 0;
  const totalHits = courses.length + lessons.length;

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <Header query={query} hasQuery={hasQuery && !tooShort} totalHits={totalHits} />

      {!hasQuery ? (
        <EmptyState
          title="検索キーワードを入力してください"
          description="上部の検索バーにコース名やレッスン名、本文のキーワードを入力して Enter。"
        />
      ) : tooShort ? (
        <EmptyState
          title={`${MIN_QUERY_LENGTH} 文字以上で検索してください`}
          description="短すぎるキーワードは検索対象外です。"
        />
      ) : totalHits === 0 ? (
        <EmptyState
          title={`「${query}」に一致する結果はありません`}
          description="別のキーワードで検索してみてください。"
        />
      ) : (
        <div className="flex flex-col gap-10">
          <CourseSection courses={courses} />
          <LessonSection lessons={lessons} />
        </div>
      )}
    </div>
  );
}

function Header({
  query,
  hasQuery,
  totalHits,
}: {
  query: string;
  hasQuery: boolean;
  totalHits: number;
}) {
  return (
    <header className="mb-7">
      <h1 className="m-0 font-bold text-[26px] tracking-tight">検索結果</h1>
      {hasQuery ? (
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          <span className="cm-mono" style={{ color: "var(--text-1)" }}>
            {query}
          </span>{" "}
          の結果 <b style={{ color: "var(--text-1)" }}>{totalHits}</b> 件
        </p>
      ) : null}
    </header>
  );
}

function CourseSection({ courses }: { courses: CourseSearchHit[] }) {
  if (courses.length === 0) return null;
  return (
    <section aria-labelledby="search-courses-heading">
      <SectionHeading id="search-courses-heading" label="コース" count={courses.length} />
      <ul className="mt-3 flex flex-col gap-2">
        {courses.map((course) => (
          <li key={course.id}>
            <CourseResultRow course={course} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LessonSection({ lessons }: { lessons: LessonSearchHit[] }) {
  if (lessons.length === 0) return null;
  return (
    <section aria-labelledby="search-lessons-heading">
      <SectionHeading id="search-lessons-heading" label="レッスン" count={lessons.length} />
      <ul className="mt-3 flex flex-col gap-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <LessonResultRow lesson={lesson} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({ id, label, count }: { id: string; label: string; count: number }) {
  return (
    <h2
      id={id}
      className="m-0 flex items-baseline gap-2 font-semibold text-[15px] tracking-tight"
      style={{ color: "var(--text-1)" }}
    >
      {label}
      <span className="cm-mono font-normal text-[12px]" style={{ color: "var(--text-3)" }}>
        {count} 件
      </span>
    </h2>
  );
}

function authorLabel(name: string | null | undefined): string {
  // Privacy: never derive a handle from email; keep it to the display name.
  return name ?? "Anonymous";
}

function CourseResultRow({ course }: { course: CourseSearchHit }) {
  const lessonCount = course.lessons.length;
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex items-start gap-3 rounded-[14px] px-4 py-3 transition hover:border-[color:var(--line-3)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <BookText className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="truncate font-semibold text-[14px] tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {course.title}
        </span>
        {course.description ? (
          <span className="line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {course.description}
          </span>
        ) : null}
        <span
          className="flex items-center gap-3 pt-0.5 text-[11.5px]"
          style={{ color: "var(--text-4)" }}
        >
          <span>{authorLabel(course.author?.name)}</span>
          <span aria-hidden="true">・</span>
          <span>
            <b style={{ color: "var(--text-2)" }}>{lessonCount}</b> レッスン
          </span>
        </span>
      </span>
    </Link>
  );
}

function LessonResultRow({ lesson }: { lesson: LessonSearchHit }) {
  return (
    <Link
      href={`/courses/${lesson.course.slug}/lessons/${lesson.slug}`}
      className="group flex items-start gap-3 rounded-[14px] px-4 py-3 transition hover:border-[color:var(--line-3)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <FileText className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="truncate font-semibold text-[14px] tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {lesson.title}
        </span>
        <span className="flex items-center gap-3 text-[11.5px]" style={{ color: "var(--text-4)" }}>
          <span className="truncate" style={{ color: "var(--text-3)" }}>
            {lesson.course.title}
          </span>
          <span aria-hidden="true">・</span>
          <span>{authorLabel(lesson.course.author?.name)}</span>
        </span>
      </span>
    </Link>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[14px] px-8 py-14 text-center"
      style={{
        background: "var(--bg-1)",
        border: "1px dashed var(--line-3)",
        color: "var(--text-3)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-full"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <SearchIcon className="size-5" />
      </span>
      <p className="m-0 font-semibold text-[14px]" style={{ color: "var(--text-1)" }}>
        {title}
      </p>
      <p className="m-0 text-[12.5px]">{description}</p>
    </div>
  );
}
