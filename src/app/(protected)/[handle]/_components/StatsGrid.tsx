import { CheckCircle2, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Stat } from "./Stat";

type StatsGridProps = {
  acCount: number;
  totalLessonsAvailable: number;
  createdCount: number;
  publishedCount: number;
  /** When provided, render the bookmarks card linking to this URL. Owner-only. */
  bookmarks?: { count: number; href: string };
};

export function StatsGrid({
  acCount,
  totalLessonsAvailable,
  createdCount,
  publishedCount,
  bookmarks,
}: StatsGridProps) {
  return (
    <div
      className="mb-7 grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      <Stat
        icon={<CheckCircle2 className="size-3.5" aria-hidden="true" />}
        label="クリア済み"
        value={String(acCount)}
        sub={totalLessonsAvailable > 0 ? `公式 ${totalLessonsAvailable} レッスン中` : undefined}
      />
      <Stat
        icon={<Sparkles className="size-3.5" aria-hidden="true" />}
        label="作成したコレクション"
        value={String(createdCount)}
        sub={`${publishedCount} 公開中`}
      />
      {bookmarks ? (
        <Link
          href={bookmarks.href}
          className="rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <div
            className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em]"
            style={{ color: "var(--text-4)", fontWeight: 600 }}
          >
            <Star className="size-3.5" aria-hidden="true" />
            お気に入り
          </div>
          <div
            className="font-semibold text-[28px] tracking-tight"
            style={{ fontFamily: "var(--font-mono-family)" }}
          >
            {bookmarks.count}
          </div>
          <div className="mt-1 font-mono text-[11.5px]" style={{ color: "var(--text-3)" }}>
            一覧を見る →
          </div>
        </Link>
      ) : null}
    </div>
  );
}
