"use client";

import type { Notification } from "@prisma/client";
import { Bell, Heart, MessageSquare, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationAsReadAction } from "@/actions/notifications";
import { cn } from "@/lib/utils";

type Props = {
  notification: Notification;
};

function typeIcon(type: Notification["type"]) {
  switch (type) {
    case "COURSE_LIKED":
      return Heart;
    case "COMMENT":
      return MessageSquare;
    case "FOLLOW":
      return UserPlus;
    default:
      return Bell;
  }
}

function formatRelative(date: Date): string {
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);
  if (diffSec < 60) return "たった今";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 時間前`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} 日前`;
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" });
}

export function NotificationRow({ notification }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isUnread = notification.readAt === null;
  const Icon = typeIcon(notification.type);

  const onActivate = () => {
    startTransition(async () => {
      if (isUnread) {
        await markNotificationAsReadAction({ id: notification.id });
      }
      if (notification.linkUrl) {
        router.push(notification.linkUrl);
      }
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: row is a composite action (mark-read + optional navigate); native <button> cannot express that mixed role cleanly
    <div
      aria-busy={isPending || undefined}
      aria-label={`${isUnread ? "未読: " : ""}${notification.title}`}
      className={cn(
        "relative flex cursor-pointer gap-3 rounded-[14px] px-4 py-3.5 transition hover:bg-[var(--bg-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-solid)]",
        isPending && "pointer-events-none opacity-60",
      )}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      role="button"
      style={{
        background: isUnread ? "var(--bg-2)" : "var(--bg-1)",
        border: `1px solid ${isUnread ? "var(--accent-solid)" : "var(--line-1)"}`,
      }}
      tabIndex={0}
    >
      {isUnread ? (
        <span
          aria-hidden="true"
          className="absolute top-4 left-1.5 size-1.5 rounded-full"
          style={{ background: "var(--accent-solid)" }}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-[10px]"
        style={{
          background: isUnread ? "var(--accent-soft)" : "var(--bg-2)",
          color: isUnread ? "var(--accent-solid)" : "var(--text-3)",
        }}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="m-0 truncate font-semibold text-[14px] tracking-tight"
            style={{ color: "var(--text-1)" }}
          >
            {notification.title}
          </h3>
          <time
            className="shrink-0 font-mono text-[11.5px]"
            dateTime={notification.createdAt.toISOString()}
            style={{ color: "var(--text-3)" }}
          >
            {formatRelative(notification.createdAt)}
          </time>
        </div>
        {notification.body ? (
          <p
            className="m-0 mt-1 line-clamp-2 text-[13px] leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {notification.body}
          </p>
        ) : null}
      </div>
    </div>
  );
}
