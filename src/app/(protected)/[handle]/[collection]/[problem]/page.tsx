import type { Problem } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { collectionUrl } from "@/lib/routes";
import { getCollectionByHandleAndSlug } from "@/services/collectionService";

export const dynamic = "force-dynamic";

export default async function ProblemPage({
  params,
}: PageProps<"/[handle]/[collection]/[problem]">) {
  await requireAuth();
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

  const collectionLinkable = {
    slug: collection.slug,
    author: { handle: collection.author.handle },
  };

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "880px" }}>
      <Link
        href={collectionUrl(collectionLinkable)}
        className="mb-4 inline-flex items-center gap-1 text-[13px]"
        style={{ color: "var(--text-3)" }}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> {collection.title}
      </Link>

      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">{problem.title}</h1>
        <div className="mt-1.5 font-mono text-[12px]" style={{ color: "var(--text-3)" }}>
          {collection.author.handle} / {collection.slug} / {problem.slug}
        </div>
      </header>

      <article
        className="prose prose-invert max-w-none rounded-[16px] p-6"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.contentMd}</ReactMarkdown>
      </article>

      <p className="mt-4 text-[12px]" style={{ color: "var(--text-4)" }}>
        コードエディタは別 issue で実装予定です。
      </p>
    </div>
  );
}
