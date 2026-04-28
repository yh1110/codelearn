"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * Visible label after the arrow icon. Defaults to "もどる" so every back
   * button across the app reads consistently — page-specific labels (e.g.
   * a parent page's title) tend to confuse users who associate the button
   * with what is on the previous screen, not where it is in the URL tree.
   */
  children?: ReactNode;
  /** Pushed instead of router.back() when the user has no history (e.g. opened in a new tab). */
  fallbackHref?: string;
  className?: string;
};

export function BackLink({ children = "戻る", fallbackHref = "/", className }: Props) {
  const router = useRouter();

  const onClick = () => {
    // window.history.length is 1 when the tab opened directly to this page.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-[13px] transition hover:underline",
        className,
      )}
      style={{ color: "var(--text-3)" }}
    >
      <ArrowLeft className="size-3.5" aria-hidden="true" /> {children}
    </button>
  );
}
