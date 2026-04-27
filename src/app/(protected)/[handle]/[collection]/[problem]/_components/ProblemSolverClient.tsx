"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { completeProblemAction } from "@/actions/progress";
import { ProblemSolver } from "@/components/problem-solver/ProblemSolver";
import { type CollectionLinkable, collectionUrl } from "@/lib/routes";

type Problem = {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
};

type Props = {
  collection: CollectionLinkable & { title: string };
  problem: Problem;
  initiallyCompleted: boolean;
};

export function ProblemSolverClient({ collection, problem, initiallyCompleted }: Props) {
  return (
    <ProblemSolver
      title={problem.title}
      contentMd={problem.contentMd}
      starterCode={problem.starterCode}
      expectedOutput={problem.expectedOutput}
      initialStatus={initiallyCompleted ? "COMPLETED" : "NOT_STARTED"}
      onSubmit={async ({ passed }) => {
        if (!passed) return;
        const result = await completeProblemAction({ problemId: problem.id });
        if (result?.serverError || result?.validationErrors) {
          throw new Error("completeProblemAction failed");
        }
      }}
      headerLeft={
        <>
          <Link
            href={collectionUrl(collection)}
            className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px]"
            style={{ color: "var(--text-2)" }}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> コレクション
          </Link>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-3)" }}>
            <span>{collection.title}</span>
            <ChevronRight className="size-3" aria-hidden="true" />
            <b style={{ color: "var(--text-1)", fontWeight: 500 }}>問題</b>
          </div>
        </>
      }
      subtitle={
        <>
          {collection.author.handle} / {collection.slug} / {problem.slug}
        </>
      }
    />
  );
}
