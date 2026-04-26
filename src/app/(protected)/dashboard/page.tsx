import { Plus } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getMyCollections } from "@/services/collectionService";
import { CollectionListItem } from "./_components/CollectionListItem";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth();
  const collections = await getMyCollections(session.userId);

  const publishedCount = collections.filter((c) => c.isPublished).length;
  const draftCount = collections.length - publishedCount;
  const totalProblems = collections.reduce((acc, c) => acc + c.problems.length, 0);

  return (
    <div className="cm-route-enter mx-auto w-full px-6 pt-8 pb-20" style={{ maxWidth: "1280px" }}>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 font-semibold text-[24px] tracking-tight">あなたのコレクション</h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
            問題集 (Collection) を作って、解いてもらいたい問題を公開しよう。
          </p>
        </div>
        <Link
          href="/dashboard/collections/new"
          className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2 font-semibold text-[13px] transition"
          style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
        >
          <Plus className="size-3.5" aria-hidden="true" /> 新しいコレクション
        </Link>
      </header>

      <div className="mb-7 grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <StatBox k="公開中" v={String(publishedCount)} />
        <StatBox k="下書き" v={String(draftCount)} />
        <StatBox k="総問題数" v={String(totalProblems)} />
      </div>

      {collections.length === 0 ? (
        <div
          className="rounded-[14px] px-8 py-14 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          <div className="mb-2">まだコレクションがありません。</div>
          <Link
            href="/dashboard/collections/new"
            className="inline-flex items-center gap-1.5 text-[13px]"
            style={{ color: "var(--accent-solid)" }}
          >
            <Plus className="size-3.5" aria-hidden="true" /> 最初のコレクションを作成する
          </Link>
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {collections.map((c) => (
            <li key={c.id}>
              <CollectionListItem
                collection={{
                  id: c.id,
                  slug: c.slug,
                  title: c.title,
                  description: c.description,
                  isPublished: c.isPublished,
                  problemCount: c.problems.length,
                }}
              />
            </li>
          ))}
          <li>
            <Link
              href="/dashboard/collections/new"
              className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-[14px] p-4 text-center text-[13px] transition hover:border-[color:var(--accent-line)] hover:text-[var(--accent-solid)]"
              style={{
                border: "1px dashed var(--line-3)",
                background: "transparent",
                color: "var(--text-3)",
              }}
            >
              <Plus className="size-7" aria-hidden="true" />
              <div>新しいコレクション</div>
              <div className="text-[11px]" style={{ color: "var(--text-4)" }}>
                ゼロから作る
              </div>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}

function StatBox({ k, v }: { k: string; v: string }) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className="cm-label mb-1.5">{k}</div>
      <div
        className="font-semibold text-[28px] tracking-tight"
        style={{ fontFamily: "var(--font-mono-family)" }}
      >
        {v}
      </div>
    </div>
  );
}
