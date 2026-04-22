import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { getCourseBySlug } from "@/services/courseService";
import { getCompletedLessonIdsByUser } from "@/services/progressService";

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

  const completed = await getCompletedLessonIdsByUser(
    session.userId,
    course.lessons.map((l) => l.id),
  );
  const completedIds = new Set(completed);

  return (
    <div className="mx-auto max-w-3xl flex-1 px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← コース一覧
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{course.description}</p>

      <ol className="mt-10 space-y-2">
        {course.lessons.map((l, i) => {
          const done = completedIds.has(l.id);
          return (
            <li key={l.id}>
              <Link
                className="block transition hover:opacity-80"
                href={`/courses/${course.slug}/lessons/${l.slug}`}
              >
                <Card size="sm">
                  <CardContent className="flex items-center gap-4">
                    <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                      #{i + 1}
                    </span>
                    <span className="flex-1 font-medium">{l.title}</span>
                    {done && (
                      <Check
                        aria-label="クリア済み"
                        className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
