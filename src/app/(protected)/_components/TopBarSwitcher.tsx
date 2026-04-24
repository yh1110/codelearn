"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { TopBar } from "./TopBar";

type Props = {
  displayName: string;
  avatarInitial: string;
  unreadCount: number;
};

export function TopBarSwitcher(props: Props) {
  // Segments are relative to (protected)/layout.tsx. A lesson page resolves to
  // ["courses", "<slug>", "lessons", "<lessonSlug>"] — render its own full-bleed header.
  const segments = useSelectedLayoutSegments();
  const isFullBleed = segments[0] === "courses" && segments[2] === "lessons";
  if (isFullBleed) return null;
  return <TopBar {...props} />;
}
