import { CourseCard } from "@/app/(protected)/_components/CourseCard";
import type { CourseBookmarkWithCourse } from "@/repositories";

type BookmarkCourseListProps = {
  courses: CourseBookmarkWithCourse[];
  completedLessonIds: Set<string>;
};

export function BookmarkCourseList({ courses, completedLessonIds }: BookmarkCourseListProps) {
  if (courses.length === 0) return null;
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">公式コース</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {courses.length} 件
          </span>
        </div>
      </div>
      <ul
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {courses.map((b, idx) => (
          <li key={b.id}>
            <CourseCard course={b.course} index={idx} completedIds={completedLessonIds} />
          </li>
        ))}
      </ul>
    </section>
  );
}
