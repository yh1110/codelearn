"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { RESERVED_HANDLES } from "@/lib/reservedNames";
import { type AuthedUser, TopBar } from "./TopBar";

type Props = {
  user: AuthedUser | null;
};

export function TopBarSwitcher({ user }: Props) {
  const segments = useSelectedLayoutSegments();
  const first = segments[0];
  const isFullBleed =
    segments.length === 3 &&
    (first === "learn" || (typeof first === "string" && !RESERVED_HANDLES.has(first)));
  if (isFullBleed) return null;
  return <TopBar user={user} />;
}
