"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Executor, SandpackStarterFiles, SandpackTemplate } from "@/types/problem";
import type { ProblemStatus, ProblemSubmitResult } from "./useProblemRunner";
import { WorkerProblemSolver } from "./WorkerProblemSolver";

// Sandpack pulls in CodeMirror, the bundler iframe wiring, and a hefty CSS
// payload. Gate it behind next/dynamic so WORKER lessons (the default, and
// the majority of existing content) never download the chunk. ssr:false is
// required because Sandpack mounts an iframe.
const SandpackProblemSolver = dynamic(
  () => import("./SandpackProblemSolver").then((m) => m.SandpackProblemSolver),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-dvh items-center justify-center font-mono text-[12px]"
        style={{ background: "var(--bg-0)", color: "var(--text-3)" }}
      >
        Sandpack を読み込み中…
      </div>
    ),
  },
);

type CommonProps = {
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  onSubmit?: (result: ProblemSubmitResult) => Promise<void>;
  initialStatus?: ProblemStatus;
  headerLeft?: ReactNode;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  footerLeft?: ReactNode;
  footerHint?: ReactNode;
};

export type ProblemSolverProps = CommonProps & {
  executor?: Executor;
  sandpackTemplate?: SandpackTemplate | null;
  starterFiles?: SandpackStarterFiles | null;
};

export function ProblemSolver(props: ProblemSolverProps) {
  const { executor = "WORKER", sandpackTemplate, starterFiles, starterCode, ...rest } = props;

  if (executor === "SANDPACK") {
    if (!sandpackTemplate || !starterFiles) {
      // Schema-level invariant; surfaces only if a Lesson/Problem row was
      // hand-edited to inconsistent state.
      return (
        <div
          className="flex h-dvh items-center justify-center px-6 text-center font-mono text-[12px]"
          style={{ background: "var(--bg-0)", color: "var(--err)" }}
        >
          このレッスンは SANDPACK 実行モードですが、template / starterFiles が設定されていません。
        </div>
      );
    }
    return (
      <SandpackProblemSolver
        {...rest}
        sandpackTemplate={sandpackTemplate}
        starterFiles={starterFiles}
      />
    );
  }

  return <WorkerProblemSolver {...rest} starterCode={starterCode} />;
}
