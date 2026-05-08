import { Users } from "lucide-react";
import type { CollectionSearchHit, ProblemSearchHit } from "@/repositories";
import { SearchResultCollections } from "./SearchResultCollections";
import { SearchResultProblems } from "./SearchResultProblems";

type Props = {
  collections: CollectionSearchHit[];
  problems: ProblemSearchHit[];
};

export function SearchSectionCommunity({ collections, problems }: Props) {
  const total = collections.length + problems.length;
  if (total === 0) return null;

  return (
    <section aria-labelledby="search-section-community">
      <h2
        id="search-section-community"
        className="m-0 mb-4 flex items-center gap-2 font-bold text-[18px] tracking-tight"
        style={{ color: "var(--text-1)" }}
      >
        <Users aria-hidden="true" className="size-4" style={{ color: "var(--text-2)" }} />
        コミュニティ
        <span className="cm-mono font-normal text-[12.5px]" style={{ color: "var(--text-3)" }}>
          {total} 件
        </span>
      </h2>
      <div className="flex flex-col gap-7">
        <SearchResultCollections collections={collections} />
        <SearchResultProblems problems={problems} />
      </div>
    </section>
  );
}
