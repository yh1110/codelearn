import { BookText } from "lucide-react";
import Link from "next/link";
import { collectionUrl } from "@/lib/routes";
import type { CollectionSearchHit } from "@/repositories";
import { authorLabel } from "./authorLabel";
import { SectionHeading } from "./SectionHeading";

type SearchResultCollectionsProps = {
  collections: CollectionSearchHit[];
};

export function SearchResultCollections({ collections }: SearchResultCollectionsProps) {
  if (collections.length === 0) return null;
  return (
    <section aria-labelledby="search-collections-heading">
      <SectionHeading
        id="search-collections-heading"
        label="コレクション"
        count={collections.length}
      />
      <ul className="mt-3 flex flex-col gap-2">
        {collections.map((collection) => (
          <li key={collection.id}>
            <CollectionResultRow collection={collection} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CollectionResultRow({ collection }: { collection: CollectionSearchHit }) {
  const problemCount = collection.problems.length;
  return (
    <Link
      href={collectionUrl(collection)}
      className="group flex items-start gap-3 rounded-[14px] px-4 py-3 transition hover:border-[color:var(--line-3)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <BookText className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="truncate font-semibold text-[14px] tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {collection.title}
        </span>
        {collection.description ? (
          <span className="line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {collection.description}
          </span>
        ) : null}
        <span
          className="flex items-center gap-3 pt-0.5 text-[11.5px]"
          style={{ color: "var(--text-4)" }}
        >
          <span>{authorLabel(collection.author.name)}</span>
          <span aria-hidden="true">・</span>
          <span>
            <b style={{ color: "var(--text-2)" }}>{problemCount}</b> 問題
          </span>
        </span>
      </span>
    </Link>
  );
}
