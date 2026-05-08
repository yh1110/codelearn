import { ContentCard } from "@/components/content/ContentCard";
import { HandleLink } from "@/components/profile/HandleLink";
import { collectionUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CollectionWithProblemsAndAuthor } from "@/repositories";
import { coverFor, glyphFor } from "./courseCover";

type Props = {
  collection: CollectionWithProblemsAndAuthor;
  index: number;
  completedIds: Set<string>;
};

export function CollectionCard({ collection, index, completedIds }: Props) {
  const total = collection.problems.length;
  const done = collection.problems.filter((p) => completedIds.has(p.id)).length;

  return (
    <ContentCard
      href={collectionUrl(collection)}
      title={collection.title}
      description={collection.description}
      cover={
        <div className={cn("cm-cover", coverFor(index))}>
          <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
            <span className="cm-diff-badge cm-diff-1">初級</span>
          </div>
          <span className="cm-cover-glyph" aria-hidden="true">
            {glyphFor(collection.title)}
          </span>
        </div>
      }
      byline={<HandleLink author={collection.author} />}
      chips={<span className="cm-chip">#コミュニティ</span>}
      progress={{ done, total }}
      countLabel={{ count: total, suffix: "問題" }}
    />
  );
}
