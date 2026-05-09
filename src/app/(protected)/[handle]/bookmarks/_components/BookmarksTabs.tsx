import { ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { bookmarksUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type BookmarkTab = "official" | "community";

type Props = {
  handle: string;
  active: BookmarkTab;
  officialCount: number;
  communityCount: number;
};

const TABS: ReadonlyArray<{
  key: BookmarkTab;
  label: string;
  Icon: typeof ShieldCheck;
}> = [
  { key: "official", label: "公式", Icon: ShieldCheck },
  { key: "community", label: "コミュニティ", Icon: Users },
];

export function BookmarksTabs({ handle, active, officialCount, communityCount }: Props) {
  const counts: Record<BookmarkTab, number> = {
    official: officialCount,
    community: communityCount,
  };
  const base = bookmarksUrl(handle);

  return (
    <nav
      aria-label="ブックマークタブ"
      className="mb-6 flex gap-1 rounded-[10px] p-[3px]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)", width: "fit-content" }}
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const href = key === "official" ? base : `${base}?tab=community`;
        return (
          <Link
            key={key}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 font-medium text-[13px] transition",
            )}
            style={{
              color: isActive ? "var(--text-1)" : "var(--text-3)",
              background: isActive ? "var(--bg-3)" : "transparent",
            }}
          >
            <Icon
              aria-hidden="true"
              className="size-3.5"
              style={{ color: isActive ? "var(--accent-solid)" : undefined }}
            />
            {label}
            <span className="cm-mono text-[11.5px] font-normal" style={{ color: "var(--text-3)" }}>
              {counts[key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function parseBookmarkTab(value: string | string[] | undefined): BookmarkTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "community" ? "community" : "official";
}
