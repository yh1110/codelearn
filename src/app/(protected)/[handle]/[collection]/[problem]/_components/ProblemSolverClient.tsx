"use client";

import { ChevronRight } from "lucide-react";
import { completeProblemAction } from "@/actions/progress";
import { BackLink } from "@/components/navigation/BackLink";
import { ProblemSolver } from "@/components/problem-solver/ProblemSolver";
import { type CollectionLinkable, collectionUrl } from "@/lib/routes";
import type { Executor, SandpackStarterFiles, SandpackTemplate } from "@/types/problem";

type Problem = {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  executor: Executor;
  sandpackTemplate: SandpackTemplate | null;
  starterFiles: SandpackStarterFiles | null;
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
      executor={problem.executor}
      sandpackTemplate={problem.sandpackTemplate}
      starterFiles={problem.starterFiles}
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
          <BackLink fallbackHref={collectionUrl(collection)} className="text-[12px]" />
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
