import { requireAuth } from "@/lib/auth";
import { TopBarSwitcher } from "../(public)/_components/TopBarSwitcher";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.profile.handle;
  const avatarInitial = (displayName.trim()[0] ?? "?").toUpperCase();
  const user = { displayName, handle: session.profile.handle, avatarInitial };

  return (
    <>
      <TopBarSwitcher user={user} />
      {children}
    </>
  );
}
