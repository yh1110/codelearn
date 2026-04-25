const DIFFICULTY_FILTERS = [
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
] as const;

const TAG_FILTERS = ["TypeScript", "基礎", "型", "関数", "配列", "オブジェクト", "入門"] as const;

const LANGUAGE_FILTERS = [
  { key: "typescript", label: "TypeScript", active: true },
  { key: "javascript", label: "JavaScript", active: false },
  { key: "python", label: "Python", active: false },
] as const;

type Props = {
  /**
   * Accessible label describing the current filter context
   * (e.g. "フィルタ (学ぶ)"). The filters themselves are disabled preview UI.
   */
  ariaLabel?: string;
};

export function BrowseFilterPanel({ ariaLabel = "フィルタ (UI プレビュー)" }: Props) {
  return (
    <aside
      className="h-max rounded-[14px] p-4 md:sticky md:top-20"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-1)",
      }}
      aria-label={ariaLabel}
    >
      <FilterGroup title="難易度">
        <ul className="space-y-0.5">
          {DIFFICULTY_FILTERS.map((d) => (
            <li key={d.key}>
              <CheckRow label={d.label} count={0} />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="タグ">
        <div className="flex flex-wrap gap-1.5">
          {TAG_FILTERS.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="対応言語">
        <ul className="space-y-0.5">
          {LANGUAGE_FILTERS.map((l) => (
            <li key={l.key}>
              <CheckRow label={l.label} checked={l.active} />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center rounded-[6px] px-2.5 py-1.5 text-[12px] opacity-60"
        style={{ color: "var(--text-2)" }}
      >
        フィルタをクリア
      </button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h2
        className="m-0 mb-2 text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--text-4)", fontWeight: 600 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckRow({
  label,
  count,
  checked = false,
}: {
  label: string;
  count?: number;
  checked?: boolean;
}) {
  return (
    <label
      className="flex cursor-not-allowed items-center justify-between py-1 text-[13px] opacity-70"
      style={{ color: "var(--text-2)" }}
    >
      <span className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          disabled
          defaultChecked={checked}
          aria-disabled="true"
          className="cursor-not-allowed"
          style={{ accentColor: "var(--accent-solid)" }}
        />
        {label}
      </span>
      {typeof count === "number" ? (
        <span className="cm-mono" style={{ color: "var(--text-4)" }}>
          {count}
        </span>
      ) : null}
    </label>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span
      className="cursor-not-allowed rounded-[999px] border px-2.5 py-0.5 text-[12px] opacity-70"
      style={{
        background: "var(--bg-2)",
        borderColor: "var(--line-1)",
        color: "var(--text-2)",
      }}
      aria-disabled="true"
      role="presentation"
    >
      {label}
    </span>
  );
}
