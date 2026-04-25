import { FileText } from "lucide-react";
import Link from "next/link";
import type { LessonSearchHit } from "@/repositories";
import { authorLabel } from "./authorLabel";
import { SectionHeading } from "./SectionHeading";

type SearchResultLessonsProps = {
  lessons: LessonSearchHit[];
};

export function SearchResultLessons({ lessons }: SearchResultLessonsProps) {
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
