import { Search as SearchIcon } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[14px] px-8 py-14 text-center"
      style={{
        background: "var(--bg-1)",
        border: "1px dashed var(--line-3)",
        color: "var(--text-3)",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-10 items-center justify-center rounded-full"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <SearchIcon className="size-5" />
      </span>
      <p className="m-0 font-semibold text-[14px]" style={{ color: "var(--text-1)" }}>
        {title}
      </p>
      <p className="m-0 text-[12.5px]">{description}</p>
    </div>
  );
}
