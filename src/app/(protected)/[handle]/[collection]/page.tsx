import { ArrowLeft, BookText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { NotFoundError } from "@/lib/errors";
import { problemUrl, profileUrl } from "@/lib/routes";
import { getCollectionByHandleAndSlug } from "@/services/collectionService";
import { getCompletedProblemIdsByUser } from "@/services/progressService";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: PageProps<"/[handle]/[collection]">) {
  const session = await requireAuth();
  const { handle, collection: collectionSlug } = await params;

  let collection: Awaited<ReturnType<typeof getCollectionByHandleAndSlug>>;
  try {
    collection = await getCollectionByHandleAndSlug({ handle, slug: collectionSlug });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const completed = new Set(
    await getCompletedProblemIdsByUser(
      session.userId,
      collection.problems.map((p) => p.id),
    ),
  );

  const author = collection.author;
  const collectionLinkable = { slug: collection.slug, author: { handle: author.handle } };

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "960px" }}>
      <Link
        href={profileUrl(handle)}
        className="mb-4 inline-flex items-center gap-1 text-[13px]"
        style={{ color: "var(--text-3)" }}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" /> @{handle}
      </Link>

      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">{collection.title}</h1>
        <div className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          @{author.handle} · 問題 {collection.problems.length}
        </div>
        <p
          className="mt-3 max-w-prose whitespace-pre-wrap text-[14px]"
          style={{ color: "var(--text-2)" }}
        >
          {collection.description}
        </p>
      </header>

      {collection.problems.length === 0 ? (
        <div
          className="rounded-[14px] px-8 py-12 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          このコレクションにはまだ公開中の問題がありません。
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {collection.problems.map((p, i) => (
            <li key={p.id}>
              <Link
                href={problemUrl(collectionLinkable, p.slug)}
                className="flex items-center gap-3 rounded-[12px] px-4 py-3 transition hover:border-[color:var(--line-3)]"
                style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
              >
                <span className="cm-mono w-8" style={{ color: "var(--text-4)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`cm-status-dot ${
                    completed.has(p.id) ? "cm-status-ac" : "cm-status-none"
                  }`}
                  aria-hidden="true"
                />
                <span className="flex-1">
                  <span className="font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
                    {p.title}
                  </span>
                  <span
                    className="mt-0.5 inline-flex items-center gap-1 text-[12px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    <BookText className="size-3" aria-hidden="true" />
                    問題 {i + 1}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
