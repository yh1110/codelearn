"use client";

import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex h-screen flex-1 flex-col">
      <header className="flex items-center gap-4 border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <Link href={`/courses/${courseSlug}`} className="text-sm text-zinc-500 hover:underline">
          ← {courseTitle}
        </Link>
        <h1 className="text-lg font-semibold">{lesson.title}</h1>
        {completed && (
          <Badge
            className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            variant="secondary"
          >
            <Check aria-hidden="true" />
            クリア済み
          </Badge>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/2 overflow-y-auto border-r border-zinc-200 p-8 dark:border-zinc-800">
          <div className="mx-auto max-w-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="mb-5 mt-2 text-3xl font-bold">{children}</h1>,
                h2: ({ children }) => (
                  <h2 className="mb-3 mt-8 text-xl font-semibold">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-6 text-base font-semibold">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-300">{children}</p>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-pink-600 dark:bg-zinc-800 dark:text-pink-400">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="mb-4 overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm text-zinc-100">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 list-decimal space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
                    {children}
                  </ol>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-600 hover:underline">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {lesson.contentMd}
            </ReactMarkdown>
          </div>
        </aside>

        <main className="flex w-1/2 flex-col">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={running}
              onClick={run}
              size="sm"
              type="button"
            >
              {running ? "実行中..." : "▶ 実行"}
            </Button>
            <Button onClick={reset} size="sm" type="button" variant="outline">
              リセット
            </Button>
            {lesson.expectedOutput && (
              <span className="ml-2 text-xs text-zinc-500">期待出力と一致すればクリア</span>
            )}
          </div>

          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language="typescript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                tabSize: 2,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            />
          </div>

          <div className="h-48 shrink-0 overflow-auto border-t border-zinc-200 bg-zinc-50 p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-950">
            {output ? (
              <>
                {output.stdout && (
                  <pre className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-100">
                    {output.stdout}
                  </pre>
                )}
                {output.stderr && (
                  <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                    {output.stderr}
                  </pre>
                )}
                {output.timedOut && <p className="text-amber-600">⏱ タイムアウト (5s)</p>}
                {!output.stdout && !output.stderr && !output.timedOut && (
                  <p className="text-zinc-500">(出力なし)</p>
                )}
              </>
            ) : (
              <p className="text-zinc-500">実行するとここに結果が表示されます</p>
            )}
          </div>

          <nav className="flex shrink-0 items-center justify-between border-t border-zinc-200 p-3 dark:border-zinc-800">
            {prevSlug ? (
              <Link
                href={`/courses/${courseSlug}/lessons/${prevSlug}`}
                className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
              >
                ← 前のレッスン
              </Link>
            ) : (
              <span />
            )}
            {nextSlug ? (
              <Link
                href={`/courses/${courseSlug}/lessons/${nextSlug}`}
                className="text-sm text-zinc-600 hover:underline dark:text-zinc-300"
              >
                次のレッスン →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
