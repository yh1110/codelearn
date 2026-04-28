"use client";

import { Check, ChevronDown, FileText, Play, RotateCcw, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { KEY_NUDGE_PX, MAX_LEFT_RATIO, MIN_LEFT_PX } from "@/config/editor";
import { cn } from "@/lib/utils";
import { type ProblemStatus, type ProblemSubmitResult, useProblemRunner } from "./useProblemRunner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export type ProblemSolverProps = {
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
  onSubmit?: (result: ProblemSubmitResult) => Promise<void>;
  initialStatus?: ProblemStatus;
  /** Header chrome — left side (breadcrumb / back link). */
  headerLeft?: ReactNode;
  /** Small line displayed under the title. */
  subtitle?: ReactNode;
  /** Header chrome — right side, appended after the auto-rendered "クリア済み" badge. */
  headerRight?: ReactNode;
  /** Footer chrome — left side (e.g. prev / next nav). */
  footerLeft?: ReactNode;
  /** Footer chrome — center hint text (overrides the default). */
  footerHint?: ReactNode;
};

export function ProblemSolver({
  title,
  contentMd,
  starterCode,
  expectedOutput,
  onSubmit,
  initialStatus = "NOT_STARTED",
  headerLeft,
  subtitle,
  headerRight,
  footerLeft,
  footerHint,
}: ProblemSolverProps) {
  const { code, setCode, output, running, completed, run, reset } = useProblemRunner({
    starterCode,
    expectedOutput,
    initialStatus,
    onSubmit,
  });

  const passed =
    completed ||
    (!!output &&
      !output.stderr &&
      !output.timedOut &&
      output.exitCode === 0 &&
      expectedOutput !== null &&
      output.stdout.trim() === expectedOutput.trim());

  const splitRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const draggingRef = useRef(false);

  // Result panel auto-opens after a successful run, but stays collapsible so
  // the editor can use the full height while the user is typing.
  const [resultExpanded, setResultExpanded] = useState(false);
  const lastOutputRef = useRef(output);
  useEffect(() => {
    // Open the result drawer the moment a fresh output lands (Run completed).
    if (output && output !== lastOutputRef.current) {
      setResultExpanded(true);
    }
    lastOutputRef.current = output;
  }, [output]);

  const clampLeftWidth = useCallback((raw: number, containerWidth: number) => {
    const max = Math.max(MIN_LEFT_PX, containerWidth * MAX_LEFT_RATIO);
    return Math.max(MIN_LEFT_PX, Math.min(raw, max));
  }, []);

  const onResizerMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onResizerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const current = leftWidth ?? rect.width / 2;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLeftWidth(clampLeftWidth(current - KEY_NUDGE_PX, rect.width));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setLeftWidth(clampLeftWidth(current + KEY_NUDGE_PX, rect.width));
      } else if (event.key === "Home") {
        event.preventDefault();
        setLeftWidth(MIN_LEFT_PX);
      } else if (event.key === "End") {
        event.preventDefault();
        setLeftWidth(clampLeftWidth(rect.width * MAX_LEFT_RATIO, rect.width));
      }
    },
    [leftWidth, clampLeftWidth],
  );

  useEffect(() => {
    // Syncing drag state with window-level mouse events so dragging still works
    // when the pointer leaves the resizer handle.
    const onMove = (event: MouseEvent) => {
      if (!draggingRef.current || !splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const raw = event.clientX - rect.left;
      setLeftWidth(clampLeftWidth(raw, rect.width));
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [clampLeftWidth]);

  const splitStyle: CSSProperties =
    leftWidth !== null
      ? { gridTemplateColumns: `${leftWidth}px 6px minmax(0,1fr)` }
      : {
          gridTemplateColumns: "minmax(280px, 1.2fr) 6px minmax(360px, 1fr)",
        };

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "var(--bg-0)", color: "var(--text-1)" }}
    >
      {/* Problem top bar */}
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
          {passed ? (
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

      {/*
        md+ : horizontal split — left = problem, right = editor (top, main area)
        + collapsible result drawer (bottom). The drawer auto-expands on Run
        completion, leaves the editor full-height when collapsed.
        < md : body scrolls; problem → editor → result stacked, plus a fixed
        Run button bottom-right.
      */}
      <div
        ref={splitRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto md:grid md:overflow-hidden"
        style={splitStyle}
      >
        {/* LEFT pane: problem statement only */}
        <div
          className="flex min-h-[140px] flex-[1] flex-col overflow-visible border-b md:min-h-0 md:overflow-hidden md:border-b-0"
          style={{ borderColor: "var(--line-1)", minWidth: 0 }}
        >
          {/* Problem statement */}
          <div className="flex min-h-0 flex-1 flex-col overflow-visible md:overflow-hidden">
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
                    h3: ({ children }) => (
                      <h3
                        className="mt-5 mb-2 font-semibold text-[14px]"
                        style={{ color: "var(--text-1)" }}
                      >
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => <p className="mb-3 leading-7 text-[13.5px]">{children}</p>,
                    code: ({ className, children, ...rest }) => {
                      // react-markdown v10+ no longer passes an `inline` prop. Treat a single
                      // text node without a language class as inline; anything structural
                      // (multi-line content, nested nodes) is a fenced block.
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
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: "var(--accent-solid)" }}
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold" style={{ color: "var(--text-1)" }}>
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {contentMd}
                </ReactMarkdown>

                {expectedOutput ? (
                  <section className="mt-6">
                    <h2
                      className="mt-6 mb-2 font-semibold text-[15px] tracking-tight"
                      style={{ color: "var(--text-1)" }}
                    >
                      期待される出力
                    </h2>
                    <div
                      className="overflow-hidden rounded-[10px]"
                      style={{
                        background: "var(--bg-1)",
                        border: "1px solid var(--line-1)",
                      }}
                    >
                      <div
                        className="border-b px-3 py-2 font-mono text-[11px]"
                        style={{
                          borderColor: "var(--line-1)",
                          background: "var(--bg-2)",
                          color: "var(--text-3)",
                        }}
                      >
                        Expected stdout
                      </div>
                      <pre
                        className="m-0 p-3 font-mono text-[12.5px] leading-relaxed"
                        style={{ background: "var(--bg-code)", color: "var(--text-1)" }}
                      >
                        {expectedOutput}
                      </pre>
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Resizer (md+ only): adjusts left = problem / right = editor+result widths */}
        {/* biome-ignore lint/a11y/useSemanticElements: ARIA separator role is required for split-pane resize handles; <hr> cannot host interactive behavior */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="問題ペインとエディタペインの横幅を調整"
          aria-valuemin={MIN_LEFT_PX}
          aria-valuenow={leftWidth ?? undefined}
          tabIndex={0}
          onMouseDown={onResizerMouseDown}
          onKeyDown={onResizerKeyDown}
          className="relative hidden cursor-col-resize touch-none items-center justify-center border-r border-l transition-colors hover:bg-[var(--bg-2)] focus-visible:bg-[var(--bg-2)] md:flex"
          style={{
            borderColor: "var(--line-1)",
            background: "var(--bg-0)",
          }}
        >
          <span
            aria-hidden="true"
            className="h-8 w-0.5 rounded"
            style={{ background: "var(--line-2)" }}
          />
        </div>

        {/* RIGHT pane: editor (main) + collapsible result drawer (bottom) */}
        <div
          className="flex min-h-[260px] flex-[1.4] flex-col overflow-hidden md:min-h-0 md:flex-1"
          style={{ background: "var(--bg-code)", minWidth: 0 }}
        >
          {/* Editor toolbar */}
          <div
            className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b px-2.5 py-1.5"
            style={{ background: "var(--bg-0)", borderColor: "var(--line-1)" }}
          >
            <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
              <span
                className="rounded-[6px] px-2 py-0.5 font-mono text-[11px]"
                style={{ background: "var(--bg-2)", border: "1px solid var(--line-1)" }}
              >
                TypeScript
              </span>
              <span className="font-mono">main.ts</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] transition hover:bg-[var(--bg-2)]"
                style={{ color: "var(--text-2)" }}
              >
                <RotateCcw className="size-3" aria-hidden="true" /> リセット
              </button>
              <button
                type="button"
                disabled={running}
                onClick={run}
                aria-label="コードを実行"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 font-semibold text-[12.5px] transition",
                  running ? "cursor-not-allowed opacity-60" : "hover:opacity-90",
                )}
                style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
              >
                <Play className="size-3.5" aria-hidden="true" />
                {running ? "実行中…" : "実行"}
              </button>
            </div>
          </div>

          {/* Monaco editor — main area, takes all remaining vertical space */}
          <div className="relative flex-1" style={{ background: "var(--bg-code)", minHeight: 0 }}>
            <MonacoEditor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13.5,
                lineHeight: 22,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                tabSize: 2,
                fontFamily: "var(--font-mono-family)",
                fontLigatures: true,
              }}
            />
          </div>

          {/* Collapsible result drawer */}
          <div
            className={cn(
              "flex flex-shrink-0 flex-col border-t",
              resultExpanded ? "h-[240px]" : "h-9",
            )}
            style={{ borderColor: "var(--line-1)", background: "var(--bg-0)" }}
          >
            <button
              type="button"
              onClick={() => setResultExpanded((prev) => !prev)}
              className="flex flex-shrink-0 cursor-pointer items-center justify-between gap-2 border-b px-3 py-1.5 text-left transition-colors hover:bg-[var(--bg-2)]"
              style={{ borderColor: resultExpanded ? "var(--line-1)" : "transparent" }}
              aria-expanded={resultExpanded}
              aria-controls="result-drawer-body"
            >
              <span
                className="inline-flex items-center gap-2 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    resultExpanded ? "" : "-rotate-90",
                  )}
                  aria-hidden="true"
                />
                実行結果
                {running ? (
                  <span
                    className="cm-pulse inline-flex items-center gap-1 font-mono text-[11px]"
                    style={{ color: "var(--text-3)" }}
                  >
                    ● 実行中…
                  </span>
                ) : output ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 font-mono text-[11px]"
                    style={{
                      background: passed ? "var(--ok-soft)" : "var(--err-soft)",
                      color: passed ? "var(--ok)" : "var(--err)",
                    }}
                  >
                    {passed ? "Accepted" : "Wrong Answer"}
                  </span>
                ) : null}
              </span>
            </button>
            {resultExpanded ? (
              <div
                id="result-drawer-body"
                className="flex-1 overflow-auto p-4 font-mono text-[12px]"
                style={{ color: "var(--text-1)" }}
              >
                <ResultBody output={output} expected={expectedOutput} passed={passed} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile-only floating Run button — keeps the primary action one tap away
          regardless of how far the user has scrolled the body on small screens. */}
      <button
        type="button"
        disabled={running}
        onClick={run}
        aria-label="コードを実行"
        className={cn(
          "fixed right-4 bottom-16 z-30 inline-flex items-center gap-1.5 rounded-full px-5 py-3 font-semibold text-[13px] shadow-lg transition md:hidden",
          running ? "cursor-not-allowed opacity-60" : "hover:opacity-90",
        )}
        style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
      >
        <Play className="size-4" aria-hidden="true" />
        {running ? "実行中…" : "実行"}
      </button>

      {/* Bottom bar — navigation and hint only; the Run button now lives inside the editor toolbar */}
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
            (expectedOutput ? "期待出力と一致すればクリア" : "実行して動作を確認しよう")}
        </div>
        <div />
      </footer>
    </div>
  );
}

function ResultBody({
  output,
  expected,
  passed,
}: {
  output: ReturnType<typeof useProblemRunner>["output"];
  expected: string | null;
  passed: boolean;
}) {
  if (!output) {
    return (
      <div className="py-10 text-center font-sans text-[13px]" style={{ color: "var(--text-3)" }}>
        実行するとここに結果が表示されます
      </div>
    );
  }

  const hasStderr = !!output.stderr;
  const hasStdout = !!output.stdout;

  return (
    <div className="space-y-3">
      {expected !== null ? (
        <div
          className="flex items-center gap-2 rounded-[8px] px-3 py-2 font-sans text-[12.5px]"
          style={{
            background: passed ? "var(--ok-soft)" : "var(--err-soft)",
            border: `1px solid ${passed ? "oklch(0.82 0.16 145 / 0.4)" : "oklch(0.72 0.19 25 / 0.4)"}`,
            color: passed ? "var(--ok)" : "var(--err)",
          }}
        >
          {passed ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <X className="size-4" aria-hidden="true" />
          )}
          <b>{passed ? "Accepted — 期待出力と一致!" : "Wrong Answer — 期待出力と一致しません"}</b>
        </div>
      ) : null}

      {hasStdout ? (
        <div
          className="overflow-hidden rounded-[8px]"
          style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
        >
          <div
            className="border-b px-3 py-1.5 font-mono text-[11px]"
            style={{
              borderColor: "var(--line-1)",
              background: "var(--bg-2)",
              color: "var(--text-3)",
            }}
          >
            stdout
          </div>
          <pre className="m-0 whitespace-pre-wrap break-all p-3" style={{ color: "var(--text-1)" }}>
            {output.stdout}
          </pre>
        </div>
      ) : null}

      {hasStderr ? (
        <div
          className="overflow-hidden rounded-[8px]"
          style={{ background: "var(--bg-1)", border: "1px solid oklch(0.72 0.19 25 / 0.4)" }}
        >
          <div
            className="border-b px-3 py-1.5 font-mono text-[11px]"
            style={{
              borderColor: "var(--line-1)",
              background: "var(--bg-2)",
              color: "var(--err)",
            }}
          >
            stderr
          </div>
          <pre className="m-0 whitespace-pre-wrap break-all p-3" style={{ color: "var(--err)" }}>
            {output.stderr}
          </pre>
        </div>
      ) : null}

      {output.timedOut ? (
        <div
          className="rounded-[8px] px-3 py-2 font-sans text-[12.5px]"
          style={{
            background: "var(--warn-soft)",
            border: "1px solid oklch(0.84 0.15 85 / 0.4)",
            color: "var(--warn)",
          }}
        >
          ⏱ タイムアウト (5s)
        </div>
      ) : null}

      {!hasStdout && !hasStderr && !output.timedOut ? (
        <div className="font-sans" style={{ color: "var(--text-3)" }}>
          (出力なし)
        </div>
      ) : null}
    </div>
  );
}
