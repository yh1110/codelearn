"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";

type Props = {
  displayName: string;
  avatarInitial: string;
};

export function TopBarSwitcher(props: Props) {
  const pathname = usePathname();
  // Lesson page renders its own ProblemTopBar in LessonClient (full-bleed layout).
  const isFullBleed = /^\/courses\/[^/]+\/lessons\/[^/]+\/?$/.test(pathname);
  if (isFullBleed) return null;
  return <TopBar {...props} />;
}
