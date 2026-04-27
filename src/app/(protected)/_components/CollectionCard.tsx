import { BookText } from "lucide-react";
import Link from "next/link";
import { collectionUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { CollectionAuthor, CollectionWithProblemsAndAuthor } from "@/repositories";
import { coverFor, glyphFor } from "./courseCover";

function authorLabel(author: CollectionAuthor): string {
  // Fall back to "Anonymous" when the author didn't set a display name —
  // do NOT derive a handle from any auth identifier (privacy).
  return author.name ?? "Anonymous";
}

function authorInitial(author: CollectionAuthor): string {
  const label = authorLabel(author);
  return (Array.from(label.trim())[0] ?? "?").toUpperCase();
}

type Props = {
  collection: CollectionWithProblemsAndAuthor;
  index: number;
  completedIds: Set<string>;
};

export function CollectionCard({ collection, index, completedIds }: Props) {
  const total = collection.problems.length;
  const done = collection.problems.filter((p) => completedIds.has(p.id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

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
        <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
          <span className="cm-diff-badge cm-diff-1">初級</span>
        </div>
        <span className="cm-cover-glyph" aria-hidden="true">
          {glyphFor(collection.title)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3
          className="m-0 line-clamp-2 font-semibold text-[15px] leading-snug tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {collection.title}
        </h3>

        <div className="flex items-center gap-1.5">
          <span className="cm-avatar cm-avatar-sm" aria-hidden="true">
            {authorInitial(collection.author)}
          </span>
          <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
            {authorLabel(collection.author)}
          </span>
        </div>

        {collection.description ? (
          <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
            {collection.description}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          <span className="cm-chip">#コミュニティ</span>
        </div>

        <div className="mt-auto flex items-center gap-3">
          <div className="cm-progress flex-1">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="cm-mono" style={{ color: "var(--text-3)" }}>
            {done}/{total}
          </span>
        </div>
        <div
          className="flex items-center gap-3 border-t pt-2.5 text-[12px]"
          style={{ borderColor: "var(--line-1)", color: "var(--text-3)" }}
        >
          <span className="inline-flex items-center gap-1">
            <BookText className="size-3" aria-hidden="true" />
            <b style={{ color: "var(--text-1)" }}>{total}</b> 問題
          </span>
        </div>
      </div>
    </Link>
  );
}
