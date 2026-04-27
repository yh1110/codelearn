import Link from "next/link";
import { profileUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type HandleLinkAuthor = {
  handle: string;
  name: string | null;
  avatarUrl: string | null;
};

type Props = {
  author: HandleLinkAuthor;
  size?: "xs" | "sm" | "md";
  showHandle?: boolean;
  className?: string;
};

function initial(value: string): string {
  return (Array.from(value.trim())[0] ?? "?").toUpperCase();
}

export function HandleLink({ author, size = "sm", showHandle = false, className }: Props) {
  const displayName = author.name ?? author.handle;
  const avatarSize = size === "xs" ? "size-4" : size === "sm" ? "size-5" : "size-6";
  const textSize = size === "xs" ? "text-[11px]" : size === "sm" ? "text-[12px]" : "text-[13px]";

  return (
    <Link
      href={profileUrl(author.handle)}
      className={cn(
        "group/handle inline-flex items-center gap-1.5 rounded-full transition hover:opacity-90",
        className,
      )}
    >
      {author.avatarUrl ? (
        // biome-ignore lint/performance/noImgElement: avatar URLs are user-supplied (Supabase Storage / external); switching to next/image would require configuring remotePatterns for every host
        <img
          src={author.avatarUrl}
          alt=""
          aria-hidden="true"
          className={cn(avatarSize, "shrink-0 rounded-full object-cover")}
          style={{ background: "var(--bg-2)" }}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            avatarSize,
            "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[10px]",
          )}
          style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
        >
          {initial(displayName)}
        </span>
      )}
      <span
        className={cn(textSize, "truncate group-hover/handle:underline")}
        style={{ color: "var(--text-2)" }}
      >
        {showHandle ? author.handle : displayName}
      </span>
    </Link>
  );
}
