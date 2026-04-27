import { requireAuth } from "@/lib/auth";
import { getUnreadCount } from "@/services/notificationService";
import { TopBarSwitcher } from "./_components/TopBarSwitcher";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.profile.handle;
  const avatarInitial = (displayName.trim()[0] ?? "?").toUpperCase();
  const unreadCount = await getUnreadCount(session.userId);

  return (
    <>
      <TopBarSwitcher
        displayName={displayName}
        handle={session.profile.handle}
        avatarInitial={avatarInitial}
        unreadCount={unreadCount}
      />
      {children}
    </>
  );
}
