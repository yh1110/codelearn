import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { CollectionForm } from "./_components/CollectionForm";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← マイコレクション
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">コレクションを作成</h1>
      <CollectionForm mode="create" />
    </div>
  );
}
