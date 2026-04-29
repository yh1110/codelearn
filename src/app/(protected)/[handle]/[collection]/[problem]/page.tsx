import type { Problem } from "@prisma/client";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { coerceSandpackFields } from "@/lib/sandpack";
import { getCollectionByHandleAndSlug } from "@/services/collectionService";
import { isProblemCompleted } from "@/services/progressService";
import { ProblemSolverClient } from "./_components/ProblemSolverClient";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
}: PageProps<"/[handle]/[collection]/[problem]">) {
  const session = await requireAuth();
  const { handle, collection: collectionSlug, problem: problemSlug } = await params;

  let collection: Awaited<ReturnType<typeof getCollectionByHandleAndSlug>>;
  try {
    collection = await getCollectionByHandleAndSlug({ handle, slug: collectionSlug });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const problem = collection.problems.find((p: Problem) => p.slug === problemSlug);
  if (!problem) notFound();

  const completed = await isProblemCompleted(session.userId, problem.id);
  const sandpack = coerceSandpackFields(problem);

  return (
    <ProblemSolverClient
      collection={{
        slug: collection.slug,
        title: collection.title,
        author: { handle: collection.author.handle },
      }}
      problem={{
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        contentMd: problem.contentMd,
        starterCode: problem.starterCode,
        expectedOutput: problem.expectedOutput,
        executor: problem.executor,
        sandpackTemplate: sandpack.sandpackTemplate,
        starterFiles: sandpack.starterFiles,
      }}
      initiallyCompleted={completed}
    />
  );
}
