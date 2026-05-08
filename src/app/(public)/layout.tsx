import { getOptionalAuth } from "@/lib/auth";
import { getUnreadCount } from "@/services/notificationService";
import { TopBarSwitcher } from "./_components/TopBarSwitcher";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getOptionalAuth();

  let user: React.ComponentProps<typeof TopBarSwitcher>["user"] = null;
  if (session) {
    const displayName = session.profile.name ?? session.profile.handle;
    const avatarInitial = (displayName.trim()[0] ?? "?").toUpperCase();
    const unreadCount = await getUnreadCount(session.userId);
    user = { displayName, handle: session.profile.handle, avatarInitial, unreadCount };
  }

  return (
    <>
      <TopBarSwitcher user={user} />
      {children}
    </>
  );
}
