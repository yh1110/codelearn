import Link from "next/link";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="flex min-h-[calc(100vh-2.5rem)] flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 p-4 text-sm dark:border-zinc-800 md:block">
        <nav aria-label="ダッシュボード">
          <h2 className="mb-3 font-semibold text-zinc-500 uppercase tracking-wide text-xs">
            クリエイター
          </h2>
          <ul className="space-y-1">
            <li>
              <Link href="/dashboard" className="block rounded-md px-2 py-1 hover:bg-muted">
                マイコース
              </Link>
            </li>
            <li>
              <Link href="/" className="block rounded-md px-2 py-1 hover:bg-muted">
                学習画面へ戻る
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
