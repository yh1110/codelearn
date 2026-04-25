import { Bell } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getNotifications } from "@/services/notificationService";
import { MarkAllAsReadButton } from "./_components/MarkAllAsReadButton";
import { NotificationRow } from "./_components/NotificationRow";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requireAuth();
  const notifications = await getNotifications({ userId: session.userId, limit: 50 });
  const unreadCount = notifications.reduce((acc, n) => (n.readAt === null ? acc + 1 : acc), 0);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "960px" }}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="m-0 font-bold text-[22px] tracking-tight">通知</h1>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {unreadCount > 0
              ? `${unreadCount} 件の未読`
              : notifications.length > 0
                ? "すべて既読です"
                : "通知はまだありません"}
          </span>
        </div>
        <MarkAllAsReadButton disabled={unreadCount === 0} />
      </div>

      {notifications.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-[14px] px-6 py-16 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          <Bell aria-hidden="true" className="size-6" style={{ color: "var(--text-4)" }} />
          まだ通知はありません。新しい通知が届くとここに表示されます。
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((n) => (
            <li key={n.id}>
              <NotificationRow notification={n} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
