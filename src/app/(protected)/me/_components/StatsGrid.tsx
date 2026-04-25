import { CheckCircle2, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Stat } from "./Stat";

type StatsGridProps = {
  acCount: number;
  totalLessonsAvailable: number;
  createdCount: number;
  publishedCount: number;
  bookmarkCount: number;
};

export function StatsGrid({
  acCount,
  totalLessonsAvailable,
  createdCount,
  publishedCount,
  bookmarkCount,
}: StatsGridProps) {
  return (
    <div
      className="mb-7 grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      <Stat
        icon={<CheckCircle2 className="size-3.5" aria-hidden="true" />}
        label="クリア済みレッスン"
        value={String(acCount)}
        sub={totalLessonsAvailable > 0 ? `${totalLessonsAvailable} 中` : undefined}
      />
      <Stat
        icon={<Sparkles className="size-3.5" aria-hidden="true" />}
        label="作成したコース"
        value={String(createdCount)}
        sub={`${publishedCount} 公開中`}
      />
      <Link
        href="/bookmarks"
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
          {bookmarkCount}
        </div>
        <div className="mt-1 font-mono text-[11.5px]" style={{ color: "var(--text-3)" }}>
          一覧を見る →
        </div>
      </Link>
    </div>
  );
}
