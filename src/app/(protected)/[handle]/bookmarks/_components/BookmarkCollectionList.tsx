import { CollectionCard } from "@/app/(protected)/_components/CollectionCard";
import type { CollectionBookmarkWithCollection } from "@/repositories";

type BookmarkCollectionListProps = {
  collections: CollectionBookmarkWithCollection[];
  completedProblemIds: Set<string>;
};

export function BookmarkCollectionList({
  collections,
  completedProblemIds,
}: BookmarkCollectionListProps) {
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
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {collections.map((b, idx) => (
          <li key={b.id}>
            <CollectionCard
              collection={b.collection}
              index={idx}
              completedIds={completedProblemIds}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
