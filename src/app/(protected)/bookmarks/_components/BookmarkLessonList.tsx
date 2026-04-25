import { BookText } from "lucide-react";
import Link from "next/link";
import { lessonUrl } from "@/lib/routes";
import type { LessonBookmarkWithLesson } from "@/repositories";

type BookmarkLessonListProps = {
  lessons: LessonBookmarkWithLesson[];
};

export function BookmarkLessonList({ lessons }: BookmarkLessonListProps) {
  if (lessons.length === 0) return null;
  return (
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
            <LessonBookmarkRow lesson={b.lesson} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LessonBookmarkRow({ lesson }: { lesson: LessonBookmarkWithLesson["lesson"] }) {
  return (
    <Link
      href={lessonUrl(lesson.course, lesson.slug)}
      className="flex items-center gap-3 rounded-[12px] px-4 py-3 transition hover:bg-[var(--bg-2)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <BookText className="size-3.5" aria-hidden="true" style={{ color: "var(--text-3)" }} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
          {lesson.title}
        </div>
        <div className="mt-0.5 truncate text-[12px]" style={{ color: "var(--text-3)" }}>
          {lesson.course.title}
        </div>
      </div>
    </Link>
  );
}
