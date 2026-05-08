import { notFound, redirect } from "next/navigation";
import { getOptionalAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { isLessonBookmarked } from "@/services/bookmarkService";
import { getCourseBySlug } from "@/services/courseService";
import { isLessonCompleted } from "@/services/progressService";
import { LessonSolver } from "./_components/LessonSolver";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: PageProps<"/learn/[course]/[lesson]">) {
  const session = await getOptionalAuth();
  const { course: courseSlug, lesson: lessonSlug } = await params;

  if (!session) redirect(`/login?from=/learn/${courseSlug}/${lessonSlug}`);

  let course: Awaited<ReturnType<typeof getCourseBySlug>>;
  try {
    course = await getCourseBySlug(courseSlug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) notFound();

  const lesson = course.lessons[idx];
  const prev = idx > 0 ? course.lessons[idx - 1] : null;
  const next = idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;

  const [completed, bookmarked] = await Promise.all([
    session ? isLessonCompleted(session.userId, lesson.id) : Promise.resolve(false),
    session
      ? isLessonBookmarked({ userId: session.userId, lessonId: lesson.id })
      : Promise.resolve(false),
  ]);

  return (
    <LessonSolver
      course={course}
      courseTitle={course.title}
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        contentMd: lesson.contentMd,
        starterCode: lesson.starterCode,
        expectedOutput: lesson.expectedOutput,
      }}
      prevSlug={prev?.slug ?? null}
      nextSlug={next?.slug ?? null}
      initiallyCompleted={completed}
      initiallyBookmarked={bookmarked}
    />
  );
}
