import { getOptionalAuth } from "@/lib/auth";
import { TopBarSwitcher } from "./_components/TopBarSwitcher";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getOptionalAuth();

  let user: React.ComponentProps<typeof TopBarSwitcher>["user"] = null;
  if (session) {
    const displayName = session.profile.name ?? session.profile.handle;
    const avatarInitial = (displayName.trim()[0] ?? "?").toUpperCase();
    user = { displayName, handle: session.profile.handle, avatarInitial };
  }

  return (
    <>
      <TopBarSwitcher user={user} />
      {children}
    </>
  );
}
