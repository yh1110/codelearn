import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { CourseForm } from "./_components/CourseForm";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← マイコース
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">コースを作成</h1>
      <CourseForm mode="create" />
    </div>
  );
}
