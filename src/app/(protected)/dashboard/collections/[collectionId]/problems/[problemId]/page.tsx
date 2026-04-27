import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getMyCollectionById } from "@/services/collectionService";
import { getMyProblemById } from "@/services/problemService";
import { ProblemForm } from "../new/_components/ProblemForm";

export const dynamic = "force-dynamic";

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ collectionId: string; problemId: string }>;
}) {
  const session = await requireAuth();
  const { collectionId, problemId } = await params;

  try {
    await getMyCollectionById({ id: collectionId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  let problem: Awaited<ReturnType<typeof getMyProblemById>>;
  try {
    problem = await getMyProblemById({ id: problemId, authorId: session.userId });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    if (error instanceof ForbiddenError) throw error;
    throw error;
  }

  if (problem.collectionId !== collectionId) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/dashboard/collections/${collectionId}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← コレクション編集
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-bold">問題を編集</h1>
      <ProblemForm
        mode="edit"
        collectionId={collectionId}
        problemId={problem.id}
        initial={{
          slug: problem.slug,
          title: problem.title,
          contentMd: problem.contentMd,
          starterCode: problem.starterCode,
          expectedOutput: problem.expectedOutput ?? "",
          order: String(problem.order),
        }}
      />
    </div>
  );
}
