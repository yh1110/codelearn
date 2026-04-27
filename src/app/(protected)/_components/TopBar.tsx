"use client";

import { Bell, BookOpen, Compass, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { bookmarksUrl, profileUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  handle: string;
  avatarInitial: string;
  unreadCount: number;
};

type NavGroup = "learn" | "explore" | "create" | null;

function resolveNavGroup(pathname: string): NavGroup {
  if (pathname.startsWith("/dashboard")) return "create";
  if (pathname.startsWith("/learn")) return "learn";
  if (pathname === "/") return "explore";
  return null;
}

export function TopBar({ displayName, handle, avatarInitial, unreadCount }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const group = resolveNavGroup(pathname);
  const initialQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";
  const hasUnread = unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const bellAriaLabel = hasUnread ? `通知 (${unreadCount} 件の未読)` : "通知";
  const myProfileHref = profileUrl(handle);
  const myBookmarksHref = bookmarksUrl(handle);

  return (
    <header
      className="sticky top-0 z-50 grid items-center gap-6 border-b px-6 py-3 backdrop-blur"
      style={{
        gridTemplateColumns: "240px 1fr auto",
        background: "oklch(0.18 0.008 280 / 0.85)",
        borderColor: "var(--line-1)",
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 font-bold text-[15px] tracking-tight"
        aria-label="Arcode ホーム"
      >
        <span className="cm-brand-mark" aria-hidden="true">
          {"</>"}
        </span>
        <span>Arcode</span>
        <span
          className="ml-0.5 font-mono font-normal text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          beta
        </span>
      </Link>

      <form action="/search" method="get" className="relative mx-auto w-full max-w-[520px]">
        <Search
          aria-hidden="true"
          className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-3.5"
          style={{ color: "var(--text-3)" }}
        />
        {/* `key` forces a remount whenever the URL query changes so `defaultValue`
            re-syncs (e.g. navigating back/forward between search pages). */}
        <input
          key={initialQuery}
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="コース・コレクションを検索"
          aria-label="コース・コレクションを検索"
          autoComplete="off"
          className="w-full rounded-[10px] py-[9px] pr-10 pl-10 text-[13px] outline-none transition focus:border-[color:var(--accent-solid)]"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line-2)",
            color: "var(--text-1)",
          }}
        />
      </form>

      <div className="flex items-center gap-2">
        <nav
          aria-label="主要ナビゲーション"
          className="flex gap-0.5 rounded-[10px] p-[3px]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <NavTab href="/" active={group === "explore"} icon={<Compass className="size-3.5" />}>
            探す
          </NavTab>
          <NavTab href="/learn" active={group === "learn"} icon={<BookOpen className="size-3.5" />}>
            学ぶ
          </NavTab>
          <NavTab
            href="/dashboard"
            active={group === "create"}
            icon={<Plus className="size-3.5" />}
          >
            作る
          </NavTab>
        </nav>
        <Link
          href={myBookmarksHref}
          aria-label="お気に入り"
          aria-current={pathname === myBookmarksHref ? "page" : undefined}
          className="hidden items-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] transition hover:bg-[var(--bg-2)] sm:inline-flex"
          style={{ color: "var(--text-2)" }}
        >
          ブックマーク
        </Link>
        <Link
          href="/notifications"
          aria-label={bellAriaLabel}
          aria-current={pathname === "/notifications" ? "page" : undefined}
          className="relative grid size-9 place-items-center rounded-[10px] transition hover:bg-[var(--bg-2)]"
          style={{ color: "var(--text-2)" }}
        >
          <Bell className="size-[18px]" />
          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 font-semibold text-[10px] leading-none"
              style={{
                background: "var(--accent-solid)",
                color: "var(--bg-0)",
                border: "2px solid var(--bg-0)",
              }}
            >
              {badgeLabel}
            </span>
          ) : null}
        </Link>
        <Link
          href={myProfileHref}
          className="cm-avatar"
          aria-label={`${displayName} のプロフィール`}
          title={displayName}
        >
          {avatarInitial}
        </Link>
      </div>
    </header>
  );
}

function NavTab({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 font-medium text-[13px] transition",
      )}
      style={{
        color: active ? "var(--text-1)" : "var(--text-3)",
        background: active ? "var(--bg-3)" : "transparent",
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex"
        style={{ color: active ? "var(--accent-solid)" : undefined }}
      >
        {icon}
      </span>
      {children}
    </Link>
  );
}
