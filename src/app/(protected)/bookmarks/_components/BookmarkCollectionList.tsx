import Link from "next/link";
import { coverFor, glyphFor } from "@/app/(protected)/_components/courseCover";
import { collectionUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CollectionBookmarkWithCollection } from "@/repositories";

type BookmarkCollectionListProps = {
  collections: CollectionBookmarkWithCollection[];
};

export function BookmarkCollectionList({ collections }: BookmarkCollectionListProps) {
  if (collections.length === 0) return null;
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">コレクション</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {collections.length} 件
          </span>
        </div>
      </div>
      <ul
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {collections.map((b, idx) => (
          <li key={b.id}>
            <CollectionBookmarkCard collection={b.collection} index={idx} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CollectionBookmarkCard({
  collection,
  index,
}: {
  collection: CollectionBookmarkWithCollection["collection"];
  index: number;
}) {
  return (
    <Link
      href={collectionUrl(collection)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[14px] transition",
        "hover:-translate-y-0.5 hover:border-[color:var(--line-3)]",
      )}
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className={cn("cm-cover", coverFor(index))}>
        <span className="cm-cover-glyph" aria-hidden="true">
          {glyphFor(collection.title)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {collection.title}
        </h3>
        {collection.description ? (
          <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {collection.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
