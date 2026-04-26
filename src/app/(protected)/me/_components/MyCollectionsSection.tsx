import Link from "next/link";
import type { CollectionWithProblemIds } from "@/repositories";

type MyCollectionsSectionProps = {
  myCollections: CollectionWithProblemIds[];
};

export function MyCollectionsSection({ myCollections }: MyCollectionsSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">作成したコレクション</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            あなたが作者として公開 / 管理しているコレクション
          </span>
        </div>
        <Link href="/dashboard" className="text-[13px]" style={{ color: "var(--accent-solid)" }}>
          管理する →
        </Link>
      </div>
      {myCollections.length === 0 ? (
        <div
          className="rounded-[14px] px-6 py-10 text-center text-[13px]"
          style={{
            background: "var(--bg-1)",
            border: "1px dashed var(--line-3)",
            color: "var(--text-3)",
          }}
        >
          まだコレクションを作成していません。
          <Link
            href="/dashboard/collections/new"
            className="ml-1 text-[13px]"
            style={{ color: "var(--accent-solid)" }}
          >
            最初のコレクションを作る
          </Link>
        </div>
      ) : (
        <ul
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {myCollections.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/collections/${c.id}`}
                className="flex h-full flex-col gap-2 rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
                style={{
                  background: "var(--bg-1)",
                  border: "1px solid var(--line-1)",
                  minHeight: 140,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="m-0 font-semibold text-[14.5px] leading-snug tracking-tight"
                    style={{ color: "var(--text-1)" }}
                  >
                    {c.title}
                  </h3>
                  <span
                    className={`cm-status-pill ${
                      c.isPublished ? "cm-status-pill-pub" : "cm-status-pill-draft"
                    }`}
                  >
                    {c.isPublished ? "公開中" : "下書き"}
                  </span>
                </div>
                {c.description ? (
                  <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
                    {c.description}
                  </p>
                ) : null}
                <div
                  className="mt-auto flex items-center gap-3 border-t pt-2.5 font-mono text-[12px]"
                  style={{
                    borderColor: "var(--line-1)",
                    color: "var(--text-3)",
                  }}
                >
                  <span>
                    問題 <b style={{ color: "var(--text-1)" }}>{c.problems.length}</b>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
