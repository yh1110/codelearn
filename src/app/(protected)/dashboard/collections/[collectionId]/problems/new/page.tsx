import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCollectionById } from "@/services/collectionService";
import { ProblemForm } from "./_components/ProblemForm";

export const dynamic = "force-dynamic";

export default async function NewProblemPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const session = await requireAuth();
  const { collectionId } = await params;

  try {
    await getMyCollectionById({ id: collectionId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/collections/${collectionId}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← コレクション編集
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">問題を追加</h1>
      <ProblemForm mode="create" collectionId={collectionId} />
    </div>
  );
}
