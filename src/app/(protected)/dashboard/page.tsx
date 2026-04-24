import { Plus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { getMyCourses } from "@/services/courseService";
import { CourseListItem } from "./_components/CourseListItem";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const courses = await getMyCourses(session.userId);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">マイコース</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            自分が作成したコースを管理できます。公開するとすべての学習者が閲覧可能になります。
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className={buttonVariants({ variant: "default", size: "sm" })}
        >
          <Plus aria-hidden="true" />
          コース作成
        </Link>
      </header>

      {courses.length === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-muted-foreground dark:border-zinc-700">
          まだコースがありません。
          <br />
          <Link
            className="mt-3 inline-block text-primary hover:underline"
            href="/dashboard/courses/new"
          >
            最初のコースを作成する
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {courses.map((c) => (
            <li key={c.id}>
              <CourseListItem
                course={{
                  id: c.id,
                  slug: c.slug,
                  title: c.title,
                  description: c.description,
                  isPublished: c.isPublished,
                  lessonCount: c.lessons.length,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
