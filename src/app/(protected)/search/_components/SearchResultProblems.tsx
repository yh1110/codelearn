import { FileText } from "lucide-react";
import Link from "next/link";
import { problemUrl } from "@/lib/routes";
import type { ProblemSearchHit } from "@/repositories";
import { authorLabel } from "./authorLabel";
import { SectionHeading } from "./SectionHeading";

type SearchResultProblemsProps = {
  problems: ProblemSearchHit[];
};

export function SearchResultProblems({ problems }: SearchResultProblemsProps) {
  if (problems.length === 0) return null;
  return (
    <section aria-labelledby="search-problems-heading">
      <SectionHeading id="search-problems-heading" label="問題" count={problems.length} />
      <ul className="mt-3 flex flex-col gap-2">
        {problems.map((problem) => (
          <li key={problem.id}>
            <ProblemResultRow problem={problem} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProblemResultRow({ problem }: { problem: ProblemSearchHit }) {
  return (
    <Link
      href={problemUrl(problem.collection, problem.slug)}
      className="group flex items-start gap-3 rounded-[14px] px-4 py-3 transition hover:border-[color:var(--line-3)]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]"
        style={{ background: "var(--bg-2)", color: "var(--text-2)" }}
      >
        <FileText className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="truncate font-semibold text-[14px] tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          {problem.title}
        </span>
        <span className="flex items-center gap-3 text-[11.5px]" style={{ color: "var(--text-4)" }}>
          <span className="truncate" style={{ color: "var(--text-3)" }}>
            {problem.collection.title}
          </span>
          <span aria-hidden="true">・</span>
          <span>{authorLabel(problem.collection.author.name)}</span>
        </span>
      </span>
    </Link>
  );
}
