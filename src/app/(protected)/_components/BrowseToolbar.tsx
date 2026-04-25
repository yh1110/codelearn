import { LayoutGrid, Rows3 } from "lucide-react";

export type SortOption = { key: string; label: string };

type Props = {
  total: number;
  sortOptions: ReadonlyArray<SortOption>;
  activeSortKey: string;
};

export function BrowseToolbar({ total, sortOptions, activeSortKey }: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="text-[13px]" style={{ color: "var(--text-3)" }}>
        <b style={{ color: "var(--text-1)" }}>{total}</b> / {total} 件
      </div>
      <div className="flex items-center gap-2">
        <fieldset className="cm-segment m-0 border-0 p-[3px]" disabled>
          <legend className="sr-only">並び替え (UI プレビュー)</legend>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-pressed={opt.key === activeSortKey}
              className="cursor-not-allowed"
            >
              {opt.label}
            </button>
          ))}
        </fieldset>
        <fieldset className="cm-segment m-0 border-0 p-[3px]">
          <legend className="sr-only">表示切替 (UI プレビュー)</legend>
          <button type="button" aria-pressed="true" aria-label="グリッド表示">
            <LayoutGrid className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled
            aria-pressed="false"
            aria-label="リスト表示 (準備中)"
            className="cursor-not-allowed"
          >
            <Rows3 className="size-3.5" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </div>
  );
}
