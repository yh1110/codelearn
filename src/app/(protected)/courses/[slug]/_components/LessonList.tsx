import { BookText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CourseWithLessons } from "@/repositories";

function statusClass(state: "ac" | "try" | "none") {
  if (state === "ac") return "cm-status-ac";
  if (state === "try") return "cm-status-try";
  return "cm-status-none";
}

type LessonListProps = {
  courseSlug: string;
  lessons: CourseWithLessons["lessons"];
  completedIds: Set<string>;
};

export function LessonList({ courseSlug, lessons, completedIds }: LessonListProps) {
  return (
    <>
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="m-0 font-semibold text-[18px] tracking-tight">Lessons</h2>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>
            順番に取り組むのがおすすめ
          </span>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[14px]"
        style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
      >
        <div
          className="grid items-center gap-4 border-b px-5 py-2.5"
          style={{
            gridTemplateColumns: "40px 24px 1fr 120px",
            background: "var(--bg-2)",
            borderColor: "var(--line-1)",
            color: "var(--text-4)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>#</span>
          <span />
          <span>Title</span>
          <span>Difficulty</span>
        </div>

        {lessons.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px]" style={{ color: "var(--text-3)" }}>
            このコースにはまだレッスンがありません。
          </div>
        ) : (
          <ul>
            {lessons.map((l, i) => {
              const state: "ac" | "none" = completedIds.has(l.id) ? "ac" : "none";
              const isLast = i === lessons.length - 1;
              return (
                <li key={l.id}>
                  <Link
                    href={`/courses/${courseSlug}/lessons/${l.slug}`}
                    className={cn(
                      "grid cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-[var(--bg-2)]",
                      !isLast && "border-b",
                    )}
                    style={{
                      gridTemplateColumns: "40px 24px 1fr 120px",
                      borderColor: "var(--line-1)",
                    }}
                  >
                    <span className="cm-mono" style={{ color: "var(--text-4)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      role="img"
                      aria-label={state === "ac" ? "クリア済み" : "未着手"}
                      title={state === "ac" ? "クリア済み" : "未着手"}
                      className={cn("cm-status-dot", statusClass(state))}
                    />
                    <div>
                      <div className="font-medium text-[14px]" style={{ color: "var(--text-1)" }}>
                        {l.title}
                      </div>
                      <div
                        className="mt-0.5 inline-flex items-center gap-1 text-[12px]"
                        style={{ color: "var(--text-3)" }}
                      >
                        <BookText className="size-3" aria-hidden="true" />
                        レッスン {i + 1}
                      </div>
                    </div>
                    <span>
                      <span className="cm-diff-badge cm-diff-1">初級</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
