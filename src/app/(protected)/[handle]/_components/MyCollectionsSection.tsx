import Link from "next/link";
import { collectionUrl } from "@/lib/routes";
import type { CollectionWithProblemIds } from "@/repositories";

type Author = {
  handle: string;
};

type MyCollectionsSectionProps = {
  author: Author;
  collections: CollectionWithProblemIds[];
  /** When true, also surface dashboard / draft management entry points. */
  isOwner: boolean;
};

export function MyCollectionsSection({ author, collections, isOwner }: MyCollectionsSectionProps) {
  // Visitors only see published collections; owners see drafts too because the
  // dashboard is the canonical place for them to manage in-progress work.
  const visible = isOwner ? collections : collections.filter((c) => c.isPublished);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">
            {isOwner ? "作成したコレクション" : "公開しているコレクション"}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {isOwner
              ? "あなたが作者として公開 / 管理しているコレクション"
              : `@${author.handle} が公開しているコレクション`}
          </span>
        </div>
        {isOwner ? (
          <Link href="/dashboard" className="text-[13px]" style={{ color: "var(--accent-solid)" }}>
            管理する →
          </Link>
        ) : null}
      </div>
      {visible.length === 0 ? (
        <div
          className="rounded-[14px] px-6 py-10 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          {isOwner ? (
            <>
              まだコレクションを作成していません。
              <Link
                href="/dashboard/collections/new"
                className="ml-1 text-[13px]"
                style={{ color: "var(--accent-solid)" }}
              >
                最初のコレクションを作る
              </Link>
            </>
          ) : (
            "公開中のコレクションはありません。"
          )}
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {visible.map((c) => (
            <li key={c.id}>
              <CollectionTile collection={c} author={author} isOwner={isOwner} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CollectionTile({
  collection,
  author,
  isOwner,
}: {
  collection: CollectionWithProblemIds;
  author: Author;
  isOwner: boolean;
}) {
  // Owner navigates to the dashboard editor; visitors see the public page.
  const href = isOwner
    ? `/dashboard/collections/${collection.id}`
    : collectionUrl({ slug: collection.slug, author });

  return (
    <Link
      href={href}
      className="flex h-full flex-col gap-2 rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-1)",
        minHeight: 140,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="m-0 font-semibold text-[14.5px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {collection.title}
        </h3>
        {isOwner ? (
          <span
            className={`cm-status-pill ${
              collection.isPublished ? "cm-status-pill-pub" : "cm-status-pill-draft"
            }`}
          >
            {collection.isPublished ? "公開中" : "下書き"}
          </span>
        ) : null}
      </div>
      {collection.description ? (
        <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
          {collection.description}
        </p>
      ) : null}
      <div
        className="mt-auto flex items-center gap-3 border-t pt-2.5 font-mono text-[12px]"
        style={{
          borderColor: "var(--line-1)",
          color: "var(--text-3)",
        }}
      >
        <span>
          問題 <b style={{ color: "var(--text-1)" }}>{collection.problems.length}</b>
        </span>
      </div>
    </Link>
  );
}
