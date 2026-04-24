import { requireAuth } from "@/lib/auth";
import { TopBarSwitcher } from "./_components/TopBarSwitcher";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.email ?? session.userId;
  const avatarInitial = (displayName.trim()[0] ?? "?").toUpperCase();

  return (
    <>
      <TopBarSwitcher displayName={displayName} avatarInitial={avatarInitial} />
      {children}
    </>
  );
}
