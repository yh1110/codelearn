import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCollectionById } from "@/services/collectionService";
import { getProblemsByCollection } from "@/services/problemService";
import { CollectionForm } from "../new/_components/CollectionForm";
import { ProblemListRow } from "./_components/ProblemListRow";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const session = await requireAuth();
  const { collectionId } = await params;

  let collection: Awaited<ReturnType<typeof getMyCollectionById>>;
  try {
    collection = await getMyCollectionById({ id: collectionId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  const problems = await getProblemsByCollection({
    collectionId: collection.id,
    authorId: session.userId,
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
        ← マイコレクション
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">コレクションを編集</h1>

      <section aria-labelledby="collection-meta" className="mb-10">
        <h2 id="collection-meta" className="sr-only">
          コレクション情報
        </h2>
        <CollectionForm
          mode="edit"
          collectionId={collection.id}
          initial={{
            slug: collection.slug,
            title: collection.title,
            description: collection.description,
            order: String(collection.order),
          }}
        />
      </section>

      <section aria-labelledby="problem-list">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="problem-list" className="text-lg font-semibold">
            問題
          </h2>
          <Link
            href={`/dashboard/collections/${collection.id}/problems/new`}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Plus aria-hidden="true" />
            問題追加
          </Link>
        </div>

        {problems.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-muted-foreground dark:border-zinc-700">
            まだ問題がありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {problems.map((p) => (
              <li key={p.id}>
                <ProblemListRow
                  collectionId={collection.id}
                  problem={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    order: p.order,
                    isPublished: p.isPublished,
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
