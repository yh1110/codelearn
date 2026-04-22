import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await requireAuth();
  const [courses, progress] = await Promise.all([
    prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.progress.findMany({
      where: { userId: session.userId },
      select: { lessonId: true },
    }),
  ]);

  const completedIds = new Set(progress.map((p) => p.lessonId));

  return (
    <div className="mx-auto max-w-3xl flex-1 px-6 py-16">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">codelearn</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          ブラウザで TypeScript を学ぶ。手を動かしながら進めよう。
        </p>
      </header>

      {courses.length === 0 ? (
        <p className="text-zinc-500">
          まだコースがありません。
          <code className="rounded bg-zinc-100 px-2 py-0.5 text-sm dark:bg-zinc-800">
            npm run db:seed
          </code>{" "}
          を実行してください。
        </p>
      ) : (
        <ul className="space-y-4">
          {courses.map((c) => {
            const total = c.lessons.length;
            const done = c.lessons.filter((l) => completedIds.has(l.id)).length;
            return (
              <li key={c.id}>
                <Link className="block transition hover:opacity-80" href={`/courses/${c.slug}`}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-xl">{c.title}</CardTitle>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {done} / {total} クリア
                        </span>
                      </div>
                      <CardDescription>{c.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
