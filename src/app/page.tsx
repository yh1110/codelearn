import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LOCAL_USER_ID = "local-user";

export default async function Home() {
  const [courses, progress] = await Promise.all([
    prisma.course.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: { select: { id: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.progress.findMany({
      where: { userId: LOCAL_USER_ID },
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
                <Link
                  href={`/courses/${c.slug}`}
                  className="block rounded-lg border border-zinc-200 p-5 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{c.title}</h2>
                    <span className="shrink-0 text-sm text-zinc-500">
                      {done} / {total} クリア
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">{c.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
