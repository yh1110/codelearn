import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const displayName = session.profile.name ?? session.email ?? session.userId;

  return (
    <>
      <header className="flex items-center justify-end gap-3 border-b border-zinc-800 px-4 py-2 text-sm">
        <Link href="/dashboard" className="mr-auto text-zinc-400 hover:text-zinc-200">
          ダッシュボード
        </Link>
        <span className="text-zinc-400">{displayName}</span>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-900"
          >
            Sign out
          </button>
        </form>
      </header>
      {children}
    </>
  );
}
