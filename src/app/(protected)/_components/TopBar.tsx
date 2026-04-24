"use client";

import { Bell, BookOpen, Compass, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  displayName: string;
  avatarInitial: string;
};

type NavGroup = "learn" | "explore" | "create" | null;

function resolveNavGroup(pathname: string): NavGroup {
  if (pathname.startsWith("/dashboard")) return "create";
  if (pathname.startsWith("/explore")) return "explore";
  if (pathname === "/" || pathname.startsWith("/courses") || pathname.startsWith("/me")) {
    return "learn";
  }
  return null;
}

export function TopBar({ displayName, avatarInitial }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const group = resolveNavGroup(pathname);
  const initialQuery = pathname === "/search" ? (searchParams.get("q") ?? "") : "";

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
        aria-label="codeMaker ホーム"
      >
        <span className="cm-brand-mark" aria-hidden="true">
          {"</>"}
        </span>
        <span>codeMaker</span>
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
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          key={initialQuery}
          placeholder="コース・レッスンを検索"
          aria-label="コース・レッスンを検索"
          autoComplete="off"
          className="w-full rounded-[10px] py-[9px] pr-10 pl-10 text-[13px] outline-none transition focus:border-[color:var(--accent-solid)]"
          style={{
            background: "var(--bg-1)",
            border: "1px solid var(--line-2)",
            color: "var(--text-1)",
          }}
        />
        <button type="submit" className="sr-only">
          検索する
        </button>
      </form>

      <div className="flex items-center gap-2">
        <nav
          aria-label="主要ナビゲーション"
          className="flex gap-0.5 rounded-[10px] p-[3px]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <NavTab
            href="/explore"
            active={group === "explore"}
            icon={<Compass className="size-3.5" />}
          >
            探す
          </NavTab>
          <NavTab href="/" active={group === "learn"} icon={<BookOpen className="size-3.5" />}>
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
        <button
          type="button"
          aria-label="通知"
          className="relative grid size-9 place-items-center rounded-[10px] transition"
          style={{ color: "var(--text-2)" }}
        >
          <Bell className="size-[18px]" />
          <span
            className="absolute top-2 right-2 size-2 rounded-full"
            style={{ background: "var(--accent-solid)", border: "2px solid var(--bg-0)" }}
          />
        </button>
        <Link
          href="/me"
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
