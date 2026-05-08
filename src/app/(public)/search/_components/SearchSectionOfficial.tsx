import { ShieldCheck } from "lucide-react";
import type { CourseSearchHit, LessonSearchHit } from "@/repositories";
import { SearchResultCourses } from "./SearchResultCourses";
import { SearchResultLessons } from "./SearchResultLessons";

type Props = {
  courses: CourseSearchHit[];
  lessons: LessonSearchHit[];
};

export function SearchSectionOfficial({ courses, lessons }: Props) {
  const total = courses.length + lessons.length;
  if (total === 0) return null;

  return (
    <section aria-labelledby="search-section-official">
      <h2
        id="search-section-official"
        className="m-0 mb-4 flex items-center gap-2 font-bold text-[18px] tracking-tight"
        style={{ color: "var(--text-1)" }}
      >
        <ShieldCheck
          aria-hidden="true"
          className="size-4"
          style={{ color: "var(--accent-solid)" }}
        />
        公式コース
        <span className="cm-mono font-normal text-[12.5px]" style={{ color: "var(--text-3)" }}>
          {total} 件
        </span>
      </h2>
      <div className="flex flex-col gap-7">
        <SearchResultCourses courses={courses} />
        <SearchResultLessons lessons={lessons} />
      </div>
    </section>
  );
}
