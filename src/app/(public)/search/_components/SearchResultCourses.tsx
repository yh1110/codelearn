import { BookText } from "lucide-react";
import Link from "next/link";
import { learnUrl } from "@/lib/routes";
import type { CourseSearchHit } from "@/repositories";
import { SectionHeading } from "./SectionHeading";

type SearchResultCoursesProps = {
  courses: CourseSearchHit[];
};

export function SearchResultCourses({ courses }: SearchResultCoursesProps) {
  if (courses.length === 0) return null;
  return (
    <section aria-labelledby="search-courses-heading">
      <SectionHeading id="search-courses-heading" label="公式コース" count={courses.length} />
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

function CourseResultRow({ course }: { course: CourseSearchHit }) {
  const lessonCount = course.lessons.length;
  return (
    <Link
      href={learnUrl(course)}
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
          <span>公式</span>
          <span aria-hidden="true">・</span>
          <span>
            <b style={{ color: "var(--text-2)" }}>{lessonCount}</b> レッスン
          </span>
        </span>
      </span>
    </Link>
  );
}
