"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackProviderProps,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { Check, FileText, Play, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { SandpackStarterFiles, SandpackTemplate } from "@/types/problem";
import type { ProblemStatus, ProblemSubmitResult } from "./useProblemRunner";

export type SandpackProblemSolverProps = {
  title: string;
  contentMd: string;
  /** Comma-separated tokens that must appear in any sandpack file for the
   *  attempt to pass. `null` disables auto-judgement (free-form). */
  expectedOutput: string | null;
  sandpackTemplate: SandpackTemplate;
  starterFiles: SandpackStarterFiles;
  onSubmit?: (result: ProblemSubmitResult) => Promise<void>;
  initialStatus?: ProblemStatus;
  headerLeft?: ReactNode;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  footerLeft?: ReactNode;
  footerHint?: ReactNode;
};

type JudgeOutcome = {
  passed: boolean;
  missingTokens: string[];
};

function parseRequiredTokens(spec: string | null): string[] {
  if (!spec) return [];
  return spec
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function SandpackProblemSolver({
  title,
  contentMd,
  expectedOutput,
  sandpackTemplate,
  starterFiles,
  onSubmit,
  initialStatus = "NOT_STARTED",
  headerLeft,
  subtitle,
  headerRight,
  footerLeft,
  footerHint,
}: SandpackProblemSolverProps) {
  const requiredTokens = parseRequiredTokens(expectedOutput);
  const [completed, setCompleted] = useState(initialStatus === "COMPLETED");

  const sandpackFiles: SandpackProviderProps["files"] = starterFiles;

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      style={{ background: "var(--bg-0)", color: "var(--text-1)" }}
    >
      <header
        className="grid flex-shrink-0 items-center gap-4 border-b px-5 py-2.5"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          borderColor: "var(--line-1)",
          background: "var(--bg-0)",
        }}
      >
        <div className="flex items-center gap-3">{headerLeft}</div>
        <div className="text-center">
          <h1 className="m-0 font-semibold text-[15px] tracking-tight">{title}</h1>
          {subtitle ? (
            <div className="mt-0.5 font-mono text-[11px]" style={{ color: "var(--text-4)" }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-2">
          {completed ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 font-semibold text-[11px]"
              style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
            >
              <Check className="size-3" aria-hidden="true" /> クリア済み
            </span>
          ) : null}
          {headerRight}
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:overflow-hidden"
        style={{ gridTemplateColumns: "minmax(280px, 1.2fr) minmax(360px, 1fr)" }}
      >
        {/* LEFT pane: problem statement (mirrors WorkerProblemSolver). */}
        <div
          className="flex min-h-[140px] flex-[1] flex-col overflow-visible border-b md:min-h-0 md:overflow-hidden md:border-r md:border-b-0"
          style={{ borderColor: "var(--line-1)", minWidth: 0 }}
        >
          <div
            className="flex flex-shrink-0 items-center gap-0.5 border-b px-3 py-1.5"
            style={{ borderColor: "var(--line-1)", background: "var(--bg-0)" }}
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 font-medium text-[12px]"
              style={{ color: "var(--text-1)", background: "var(--bg-2)" }}
            >
              <FileText className="size-3.5" aria-hidden="true" /> 問題
            </div>
          </div>
          <div className="flex-1 overflow-visible px-6 py-5 md:overflow-auto">
            <div className="mx-auto max-w-[720px]" style={{ color: "var(--text-2)" }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1
                      className="mt-1 mb-4 font-bold text-[22px] tracking-tight"
                      style={{ color: "var(--text-1)" }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      className="mt-6 mb-2 font-semibold text-[15px] tracking-tight"
                      style={{ color: "var(--text-1)" }}
                    >
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => <p className="mb-3 leading-7 text-[13.5px]">{children}</p>,
                  code: ({ className, children, ...rest }) => {
                    const isInline =
                      !className && typeof children === "string" && !children.includes("\n");
                    return isInline ? (
                      <code
                        className="rounded px-1.5 py-0.5 font-mono text-[0.9em]"
                        style={{
                          background: "var(--bg-2)",
                          color: "var(--accent-solid)",
                          border: "1px solid var(--line-1)",
                        }}
                      >
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...rest}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre
                      className="mb-4 overflow-x-auto rounded-[10px] p-3 font-mono text-[12.5px] leading-relaxed"
                      style={{
                        background: "var(--bg-code)",
                        border: "1px solid var(--line-1)",
                        color: "var(--text-1)",
                      }}
                    >
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
                  ),
                }}
              >
                {contentMd}
              </ReactMarkdown>

              {requiredTokens.length > 0 ? (
                <section className="mt-6">
                  <h2
                    className="mt-6 mb-2 font-semibold text-[15px] tracking-tight"
                    style={{ color: "var(--text-1)" }}
                  >
                    判定条件 (必須キーワード)
                  </h2>
                  <ul className="mb-3 list-disc space-y-1 pl-5 font-mono text-[12px]">
                    {requiredTokens.map((token) => (
                      <li key={token}>{token}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT pane: Sandpack editor + preview. */}
        <div
          className="flex min-h-[260px] flex-[1.4] flex-col overflow-hidden md:min-h-0 md:flex-1"
          style={{ background: "var(--bg-code)", minWidth: 0 }}
        >
          <SandpackProvider
            template={sandpackTemplate}
            files={sandpackFiles}
            theme="dark"
            options={{
              recompileMode: "delayed",
              recompileDelay: 500,
            }}
          >
            <SandpackJudgeBar
              completed={completed}
              requiredTokens={requiredTokens}
              onPass={async (code) => {
                if (completed) return;
                setCompleted(true);
                if (!onSubmit) return;
                try {
                  await onSubmit({ passed: true, output: "", code });
                } catch (err) {
                  setCompleted(false);
                  console.error("[SandpackProblemSolver] onSubmit threw:", err);
                }
              }}
            />
            <SandpackLayout
              style={{
                flex: 1,
                minHeight: 0,
                border: "none",
                borderRadius: 0,
              }}
            >
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                wrapContent
                style={{ height: "100%", flex: 1 }}
              />
              <SandpackPreview style={{ height: "100%", flex: 1 }} showOpenInCodeSandbox={false} />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>

      <footer
        className="grid flex-shrink-0 items-center gap-4 border-t px-5 py-2"
        style={{ gridTemplateColumns: "1fr auto 1fr", borderColor: "var(--line-1)" }}
      >
        <div className="flex gap-2">{footerLeft ?? <span />}</div>
        <div
          className="flex items-center gap-1.5 font-mono text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          {footerHint ??
            (requiredTokens.length > 0
              ? "必須キーワードがすべて含まれていればクリア"
              : "プレビューで動作を確認しよう")}
        </div>
        <div />
      </footer>
    </div>
  );
}

function judgeFiles(
  files: Record<string, { code: string }>,
  requiredTokens: string[],
): JudgeOutcome {
  if (requiredTokens.length === 0) return { passed: false, missingTokens: [] };
  const haystack = Object.values(files)
    .map((f) => f.code ?? "")
    .join("\n");
  const missingTokens = requiredTokens.filter((token) => !haystack.includes(token));
  return { passed: missingTokens.length === 0, missingTokens };
}

function SandpackJudgeBar({
  completed,
  requiredTokens,
  onPass,
}: {
  completed: boolean;
  requiredTokens: string[];
  onPass: (code: string) => Promise<void>;
}) {
  const { sandpack } = useSandpack();
  const [outcome, setOutcome] = useState<JudgeOutcome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canJudge = requiredTokens.length > 0;

  const handleJudge = async () => {
    const result = judgeFiles(sandpack.files, requiredTokens);
    setOutcome(result);
    if (!result.passed) return;
    setSubmitting(true);
    try {
      await onPass(JSON.stringify(sandpack.files));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b px-2.5 py-1.5"
      style={{ background: "var(--bg-0)", borderColor: "var(--line-1)" }}
    >
      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
        <span
          className="rounded-[6px] px-2 py-0.5 font-mono text-[11px]"
          style={{ background: "var(--bg-2)", border: "1px solid var(--line-1)" }}
        >
          Sandpack
        </span>
        {outcome && !outcome.passed ? (
          <span
            className="inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 font-mono text-[11px]"
            style={{ background: "var(--err-soft)", color: "var(--err)" }}
          >
            <X className="size-3" aria-hidden="true" /> 未達: {outcome.missingTokens.join(", ")}
          </span>
        ) : null}
        {(outcome?.passed || completed) && requiredTokens.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 font-mono text-[11px]"
            style={{ background: "var(--ok-soft)", color: "var(--ok)" }}
          >
            <Check className="size-3" aria-hidden="true" /> 判定 OK
          </span>
        ) : null}
      </div>
      {canJudge ? (
        <button
          type="button"
          disabled={submitting}
          onClick={handleJudge}
          aria-label="判定する"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 font-semibold text-[12.5px] transition",
            submitting ? "cursor-not-allowed opacity-60" : "hover:opacity-90",
          )}
          style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
        >
          <Play className="size-3.5" aria-hidden="true" />
          {submitting ? "判定中…" : "判定"}
        </button>
      ) : null}
    </div>
  );
}
