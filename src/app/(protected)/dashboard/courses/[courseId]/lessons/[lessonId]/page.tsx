import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCourseById } from "@/services/courseService";
import { getMyLessonById } from "@/services/lessonService";
import { LessonForm } from "../new/_components/LessonForm";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const session = await requireAuth();
  const { courseId, lessonId } = await params;

  try {
    await getMyCourseById({ id: courseId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  let lesson: Awaited<ReturnType<typeof getMyLessonById>>;
  try {
    lesson = await getMyLessonById({ id: lessonId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  if (lesson.courseId !== courseId) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← コース編集
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">レッスンを編集</h1>
      <LessonForm
        mode="edit"
        courseId={courseId}
        lessonId={lesson.id}
        initial={{
          slug: lesson.slug,
          title: lesson.title,
          contentMd: lesson.contentMd,
          starterCode: lesson.starterCode,
          expectedOutput: lesson.expectedOutput ?? "",
          order: String(lesson.order),
        }}
      />
    </div>
  );
}
