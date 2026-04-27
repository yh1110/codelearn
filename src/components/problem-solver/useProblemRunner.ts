"use client";

import { useState } from "react";
import { type RunResult, runCodeInBrowser } from "@/lib/run-code";

export type ProblemStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ProblemSubmitResult = {
  passed: boolean;
  output: string;
  code: string;
};

type Args = {
  starterCode: string;
  expectedOutput: string | null;
  initialStatus: ProblemStatus;
  onSubmit?: (result: ProblemSubmitResult) => Promise<void>;
};

export function useProblemRunner({ starterCode, expectedOutput, initialStatus, onSubmit }: Args) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(initialStatus === "COMPLETED");

  async function run() {
    setRunning(true);
    setOutput(null);
    try {
      const data = await runCodeInBrowser(code);
      setOutput(data);

      const passed =
        !data.stderr &&
        !data.timedOut &&
        data.exitCode === 0 &&
        expectedOutput !== null &&
        data.stdout.trim() === expectedOutput.trim();

      if (passed && !completed && onSubmit) {
        // Optimistic update: flip the badge immediately, roll back if the
        // server callback fails so the UI stays consistent with the DB.
        setCompleted(true);
        try {
          await onSubmit({ passed, output: data.stdout, code });
        } catch (err) {
          setCompleted(false);
          console.error("[useProblemRunner] onSubmit threw:", err);
        }
      }
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setCode(starterCode);
    setOutput(null);
  }

  return { code, setCode, output, running, completed, run, reset };
}
