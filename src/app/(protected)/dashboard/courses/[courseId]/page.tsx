import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCourseById } from "@/services/courseService";
import { getLessonsByCourse } from "@/services/lessonService";
import { CourseForm } from "../new/_components/CourseForm";
import { LessonListRow } from "./_components/LessonListRow";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await requireAuth();
  const { courseId } = await params;

  let course: Awaited<ReturnType<typeof getMyCourseById>>;
  try {
    course = await getMyCourseById({ id: courseId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  const lessons = await getLessonsByCourse({
    courseId: course.id,
    authorId: session.userId,
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← マイコース
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">コースを編集</h1>

      <section aria-labelledby="course-meta" className="mb-10">
        <h2 id="course-meta" className="sr-only">
          コース情報
        </h2>
        <CourseForm
          mode="edit"
          courseId={course.id}
          initial={{
            slug: course.slug,
            title: course.title,
            description: course.description,
            order: String(course.order),
          }}
        />
      </section>

      <section aria-labelledby="lesson-list">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="lesson-list" className="text-lg font-semibold">
            レッスン
          </h2>
          <Link
            href={`/dashboard/courses/${course.id}/lessons/new`}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Plus aria-hidden="true" />
            レッスン追加
          </Link>
        </div>

        {lessons.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-muted-foreground dark:border-zinc-700">
            まだレッスンがありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id}>
                <LessonListRow
                  courseId={course.id}
                  lesson={{
                    id: l.id,
                    slug: l.slug,
                    title: l.title,
                    order: l.order,
                    isPublished: l.isPublished,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
