import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { isCourseBookmarked } from "@/services/bookmarkService";
import { getCourseBySlug } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";
import { CourseHero } from "./_components/CourseHero";
import { LessonList } from "./_components/LessonList";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const session = await requireAuth();
  const { slug } = await params;

  let course: Awaited<ReturnType<typeof getCourseBySlug>>;
  try {
    course = await getCourseBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const [completed, bookmarked] = await Promise.all([
    getCompletedLessonIdsByUser(
      session.userId,
      course.lessons.map((l) => l.id),
    ),
    isCourseBookmarked({ userId: session.userId, courseId: course.id }),
  ]);
  const completedIds = new Set(completed);
  const done = course.lessons.filter((l) => completedIds.has(l.id)).length;
  const total = course.lessons.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-[13px]"
        style={{ color: "var(--text-3)" }}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> コース一覧
      </Link>

      <CourseHero course={course} done={done} total={total} pct={pct} bookmarked={bookmarked} />

      <LessonList courseSlug={course.slug} lessons={course.lessons} completedIds={completedIds} />
    </div>
  );
}
