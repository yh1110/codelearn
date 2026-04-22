import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCAL_USER_ID = "local-user";

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!course) notFound();

  const progress = await prisma.progress.findMany({
    where: {
      userId: LOCAL_USER_ID,
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
                href={`/courses/${course.slug}/lessons/${l.slug}`}
                className="flex items-center gap-4 rounded-md border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-zinc-500">#{i + 1}</span>
                <span className="flex-1 font-medium">{l.title}</span>
                {done && (
                  <span className="shrink-0 text-sm text-emerald-600 dark:text-emerald-400">✓</span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
