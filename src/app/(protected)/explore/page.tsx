import { requireAuth } from "@/lib/auth";
import { getPublishedCollectionsByNewest } from "@/services/collectionService";
import { getCompletedProblemIdsByUser } from "@/services/progressService";
import { BrowseFilterPanel } from "../_components/BrowseFilterPanel";
import { BrowseToolbar, type SortOption } from "../_components/BrowseToolbar";
import { CollectionCard } from "../_components/CollectionCard";

export const dynamic = "force-dynamic";

const EXPLORE_SORT_OPTIONS: ReadonlyArray<SortOption> = [
  { key: "newest", label: "新着" },
  { key: "popular", label: "人気" },
  { key: "ac-rate", label: "AC率高" },
  { key: "unchallenged", label: "未挑戦" },
];

export default async function ExplorePage() {
  const session = await requireAuth();
  const [collections, completed] = await Promise.all([
    getPublishedCollectionsByNewest(),
    getCompletedProblemIdsByUser(session.userId),
  ]);
  const completedIds = new Set(completed);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-7">
        <h1 className="m-0 font-bold text-[26px] tracking-tight">Explore — コミュニティの問題集</h1>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
          他のユーザーが作った Collection を探そう
        </p>
      </header>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-[240px_minmax(0,1fr)]">
        <BrowseFilterPanel ariaLabel="フィルタ (探す / UI プレビュー)" />
        <main className="min-w-0">
          <BrowseToolbar
            total={collections.length}
            sortOptions={EXPLORE_SORT_OPTIONS}
            activeSortKey="newest"
          />
          {collections.length === 0 ? (
            <div
              className="rounded-[14px] px-8 py-14 text-center text-[13px]"
              style={{
                background: "var(--bg-1)",
                border: "1px dashed var(--line-3)",
                color: "var(--text-3)",
              }}
            >
              公開されているコレクションがまだありません。
            </div>
          ) : (
            <ul
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
            >
              {collections.map((collection, idx) => (
                <li key={collection.id}>
                  <CollectionCard collection={collection} index={idx} completedIds={completedIds} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
