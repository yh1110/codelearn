import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCourseById } from "@/services/courseService";
import { LessonForm } from "./_components/LessonForm";

export const dynamic = "force-dynamic";

export default async function NewLessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await requireAuth();
  const { courseId } = await params;

  try {
    await getMyCourseById({ id: courseId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/courses/${courseId}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← コース編集
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">レッスンを追加</h1>
      <LessonForm mode="create" courseId={courseId} />
    </div>
  );
}
