"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { RESERVED_HANDLES } from "@/lib/reservedNames";
import { TopBar } from "./TopBar";

type Props = {
  displayName: string;
  handle: string;
  avatarInitial: string;
  unreadCount: number;
};

export function TopBarSwitcher(props: Props) {
  // Segments are relative to (protected)/layout.tsx. Lesson and UGC problem
  // pages run their own full-bleed header (split editor / problem chrome) and
  // suppress the global TopBar so it doesn't double-render above the editor.
  // - Official lesson : ["learn", "<course>", "<lesson>"]   (3 segments)
  // - UGC problem     : ["<handle>", "<collection>", "<problem>"] (3 segments,
  //   segment[0] must NOT be a reserved name — that is what makes it a handle)
  const segments = useSelectedLayoutSegments();
  const first = segments[0];
  const isFullBleed =
    segments.length === 3 &&
    (first === "learn" || (typeof first === "string" && !RESERVED_HANDLES.has(first)));
  if (isFullBleed) return null;
  return <TopBar {...props} />;
}
