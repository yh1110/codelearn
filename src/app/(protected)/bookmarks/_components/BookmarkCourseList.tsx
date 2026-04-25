import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CourseBookmarkWithCourse } from "@/repositories";

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

type BookmarkCourseListProps = {
  courses: CourseBookmarkWithCourse[];
};

export function BookmarkCourseList({ courses }: BookmarkCourseListProps) {
  if (courses.length === 0) return null;
  return (
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
