"use client";

import { useSelectedLayoutSegments } from "next/navigation";
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
  // - UGC problem     : ["<handle>", "<collection>", "<problem>"] (3 segments)
  // The UGC problem stub renders inline content for now, so we only suppress
  // the bar for the official lesson route until UGC gets the same treatment.
  const segments = useSelectedLayoutSegments();
  const isFullBleed = segments[0] === "learn" && segments.length === 3;
  if (isFullBleed) return null;
  return <TopBar {...props} />;
}
