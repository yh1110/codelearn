import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const session = await requireAuth();
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  const progress = await prisma.progress.findMany({
    where: {
      userId: session.userId,
      lessonId: { in: course.lessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });
  const completedIds = new Set(progress.map((p) => p.lessonId));

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
