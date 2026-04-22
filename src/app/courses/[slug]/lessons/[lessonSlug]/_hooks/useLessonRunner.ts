"use client";

import { useState } from "react";
import { completeLessonAction } from "@/actions/progress";
import { type RunResult, runCodeInBrowser } from "@/lib/run-code";

type Args = {
  lessonId: string;
  starterCode: string;
  expectedOutput: string | null;
  initiallyCompleted: boolean;
};

export function useLessonRunner({
  lessonId,
  starterCode,
  expectedOutput,
  initiallyCompleted,
}: Args) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(initiallyCompleted);

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

      if (passed && !completed) {
        setCompleted(true);
        completeLessonAction({ lessonId })
          .then((result) => {
            if (result?.serverError) {
              console.error(
                "[useLessonRunner] completeLessonAction serverError:",
                result.serverError,
              );
            }
            if (result?.validationErrors) {
              console.error(
                "[useLessonRunner] completeLessonAction validationErrors:",
                result.validationErrors,
              );
            }
          })
          .catch((err) => {
            console.error("[useLessonRunner] completeLessonAction threw:", err);
          });
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
