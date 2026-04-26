import { BookText } from "lucide-react";
import Link from "next/link";
import { problemUrl } from "@/lib/routes";
import type { ProblemBookmarkWithProblem } from "@/repositories";

type BookmarkProblemListProps = {
  problems: ProblemBookmarkWithProblem[];
};

export function BookmarkProblemList({ problems }: BookmarkProblemListProps) {
  if (problems.length === 0) return null;
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">問題</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            {problems.length} 件
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {problems.map((b) => (
          <li key={b.id}>
            <ProblemBookmarkRow problem={b.problem} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProblemBookmarkRow({ problem }: { problem: ProblemBookmarkWithProblem["problem"] }) {
  return (
    <Link
      href={problemUrl(problem.collection, problem.slug)}
      className="flex items-center gap-3 rounded-[12px] px-4 py-3 transition hover:bg-[var(--bg-2)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <BookText className="size-3.5" aria-hidden="true" style={{ color: "var(--text-3)" }} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
          {problem.title}
        </div>
        <div className="mt-0.5 truncate text-[12px]" style={{ color: "var(--text-3)" }}>
          {problem.collection.title}
        </div>
      </div>
    </Link>
  );
}
