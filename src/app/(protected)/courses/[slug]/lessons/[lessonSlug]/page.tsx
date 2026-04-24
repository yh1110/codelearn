import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { isLessonBookmarked } from "@/services/bookmarkService";
import { getCourseBySlug } from "@/services/courseService";
import { isLessonCompleted } from "@/services/progressService";
import LessonClient from "./_components/LessonClient";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: PageProps<"/courses/[slug]/lessons/[lessonSlug]">) {
  const session = await requireAuth();
  const { slug, lessonSlug } = await params;

  let course: Awaited<ReturnType<typeof getCourseBySlug>>;
  try {
    course = await getCourseBySlug(slug);
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
    isLessonCompleted(session.userId, lesson.id),
    isLessonBookmarked({ userId: session.userId, lessonId: lesson.id }),
  ]);

  return (
    <LessonClient
      courseSlug={course.slug}
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
