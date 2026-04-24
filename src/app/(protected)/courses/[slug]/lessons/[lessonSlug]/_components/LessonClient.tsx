"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useLessonRunner } from "../_hooks/useLessonRunner";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Lesson = {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
};

type Props = {
  courseSlug: string;
  courseTitle: string;
  lesson: Lesson;
  prevSlug: string | null;
  nextSlug: string | null;
  initiallyCompleted: boolean;
};

export default function LessonClient({
  courseSlug,
  courseTitle,
  lesson,
  prevSlug,
  nextSlug,
  initiallyCompleted,
}: Props) {
  const { code, setCode, output, running, completed, run, reset } = useLessonRunner({
    lessonId: lesson.id,
    starterCode: lesson.starterCode,
    expectedOutput: lesson.expectedOutput,
    initiallyCompleted,
  });

  const passed =
    completed ||
    (!!output &&
      !output.stderr &&
      !output.timedOut &&
      output.exitCode === 0 &&
      lesson.expectedOutput !== null &&
      output.stdout.trim() === lesson.expectedOutput.trim());

  return (
    <div
      className="flex h-screen flex-col"
      style={{ background: "var(--bg-0)", color: "var(--text-1)" }}
    >
      {/* Problem top bar */}
      <header
        className="grid items-center gap-4 border-b px-5 py-2.5"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          borderColor: "var(--line-1)",
          background: "var(--bg-0)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px]"
            style={{ color: "var(--text-2)" }}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> コース
          </Link>
          <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-3)" }}>
            <span>{courseTitle}</span>
            <ChevronRight className="size-3" aria-hidden="true" />
            <b style={{ color: "var(--text-1)", fontWeight: 500 }}>レッスン</b>
          </div>
        </div>
        <div className="text-center">
          <h1 className="m-0 font-semibold text-[15px] tracking-tight">{lesson.title}</h1>
          <div className="mt-0.5 font-mono text-[11px]" style={{ color: "var(--text-4)" }}>
            #{lesson.slug} · <span className="cm-diff-badge cm-diff-1 align-middle">初級</span>
          </div>
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
        </div>
      </header>

      {/* Split pane */}
      <div
        className="grid overflow-hidden"
        style={{
          gridTemplateColumns: "minmax(280px, 1fr) minmax(420px, 1.2fr)",
          flex: 1,
        }}
      >
        {/* LEFT: problem statement */}
        <div
          className="flex flex-col overflow-hidden border-r"
          style={{ borderColor: "var(--line-1)", minWidth: 0 }}
        >
          <div
            className="flex flex-shrink-0 items-center gap-0.5 border-b px-3 py-1.5"
            style={{ borderColor: "var(--line-1)", background: "var(--bg-0)" }}
          >
            <div
              className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 font-medium text-[12px]"
              style={{
                color: "var(--text-1)",
                background: "var(--bg-2)",
                boxShadow: "inset 0 -2px 0 var(--accent-solid)",
              }}
            >
              <FileText className="size-3.5" aria-hidden="true" /> 問題
            </div>
          </div>
          <div className="flex-1 overflow-auto px-6 py-5">
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
                  code: ({ className, children }) => {
                    const isInline = !className;
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
                      <code className={className}>{children}</code>
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
                    <a href={href} className="underline" style={{ color: "var(--accent-solid)" }}>
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
                {lesson.contentMd}
              </ReactMarkdown>

              {lesson.expectedOutput ? (
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
                      {lesson.expectedOutput}
                    </pre>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT: editor + results */}
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateRows: "1fr 240px",
            background: "var(--bg-code)",
            minWidth: 0,
          }}
        >
          {/* Editor */}
          <div className="flex flex-col overflow-hidden">
            <div
              className="flex flex-shrink-0 items-center justify-between border-b px-2.5 py-1.5"
              style={{ background: "var(--bg-0)", borderColor: "var(--line-1)" }}
            >
              <div
                className="flex items-center gap-2 text-[12px]"
                style={{ color: "var(--text-3)" }}
              >
                <span
                  className="rounded-[6px] px-2 py-0.5 font-mono text-[11px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--line-1)" }}
                >
                  TypeScript
                </span>
                <span className="font-mono">main.ts</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] transition hover:bg-[var(--bg-2)]"
                  style={{ color: "var(--text-2)" }}
                >
                  <RotateCcw className="size-3" aria-hidden="true" /> リセット
                </button>
              </div>
            </div>
            <div className="relative flex-1" style={{ background: "var(--bg-code)" }}>
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
          </div>

          {/* Results */}
          <div
            className="flex flex-col overflow-hidden border-t"
            style={{ background: "var(--bg-0)", borderColor: "var(--line-1)" }}
          >
            <div
              className="flex flex-shrink-0 items-center justify-between gap-2 border-b px-3 py-1.5"
              style={{ borderColor: "var(--line-1)" }}
            >
              <div
                className="inline-flex items-center gap-1.5 rounded-[6px] px-3 py-1.5 font-medium text-[12px]"
                style={{
                  color: "var(--text-1)",
                  background: "var(--bg-2)",
                  boxShadow: "inset 0 -2px 0 var(--accent-solid)",
                }}
              >
                <Play className="size-3" aria-hidden="true" /> 実行結果
              </div>
              {running ? (
                <span
                  className="cm-pulse inline-flex items-center gap-1.5 font-mono text-[11px]"
                  style={{ color: "var(--text-3)" }}
                >
                  ● 実行中…
                </span>
              ) : null}
            </div>
            <div
              className="flex-1 overflow-auto p-4 font-mono text-[12px]"
              style={{ color: "var(--text-1)" }}
            >
              <ResultBody output={output} expected={lesson.expectedOutput} passed={passed} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <footer
        className="grid items-center gap-4 border-t px-5 py-2.5"
        style={{ gridTemplateColumns: "1fr auto 1fr", borderColor: "var(--line-1)" }}
      >
        <div className="flex gap-2">
          {prevSlug ? (
            <Link
              href={`/courses/${courseSlug}/lessons/${prevSlug}`}
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" /> 前のレッスン
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link
              href={`/courses/${courseSlug}/lessons/${nextSlug}`}
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              次のレッスン <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        <div
          className="flex items-center gap-1.5 font-mono text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          {lesson.expectedOutput ? "期待出力と一致すればクリア" : "実行して動作を確認しよう"}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={running}
            onClick={run}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[10px] px-4 py-1.5 font-semibold text-[13px] transition",
              running ? "cursor-not-allowed opacity-60" : "",
            )}
            style={{ background: "var(--accent-solid)", color: "var(--accent-ink)" }}
          >
            <Play className="size-3.5" aria-hidden="true" />
            {running ? "実行中…" : "実行"}
          </button>
        </div>
      </footer>
    </div>
  );
}

function ResultBody({
  output,
  expected,
  passed,
}: {
  output: ReturnType<typeof useLessonRunner>["output"];
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
