"use client";

import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { completeLessonAction } from "@/actions/progress";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { ProblemSolver } from "@/components/problem-solver/ProblemSolver";
import { type CourseLinkable, learnUrl, lessonUrl } from "@/lib/routes";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  contentMd: string;
  starterCode: string;
  expectedOutput: string | null;
};

type Props = {
  course: CourseLinkable;
  courseTitle: string;
  lesson: Lesson;
  prevSlug: string | null;
  nextSlug: string | null;
  initiallyCompleted: boolean;
  initiallyBookmarked: boolean;
};

export function LessonSolver({
  course,
  courseTitle,
  lesson,
  prevSlug,
  nextSlug,
  initiallyCompleted,
  initiallyBookmarked,
}: Props) {
  return (
    <ProblemSolver
      title={lesson.title}
      contentMd={lesson.contentMd}
      starterCode={lesson.starterCode}
      expectedOutput={lesson.expectedOutput}
      initialStatus={initiallyCompleted ? "COMPLETED" : "NOT_STARTED"}
      onSubmit={async ({ passed }) => {
        if (!passed) return;
        const result = await completeLessonAction({ lessonId: lesson.id });
        if (result?.serverError || result?.validationErrors) {
          throw new Error("completeLessonAction failed");
        }
      }}
      headerLeft={
        <>
          <Link
            href={learnUrl(course)}
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
        </>
      }
      subtitle={
        <>
          #{lesson.slug} · <span className="cm-diff-badge cm-diff-1 align-middle">初級</span>
        </>
      }
      headerRight={
        <BookmarkButton
          target="lesson"
          lessonId={lesson.id}
          bookmarked={initiallyBookmarked}
          variant="compact"
        />
      }
      footerLeft={
        <>
          {prevSlug ? (
            <Link
              href={lessonUrl(course, prevSlug)}
              className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px]"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                color: "var(--text-1)",
              }}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" /> 前のレッスン
            </Link>
          ) : null}
          {nextSlug ? (
            <Link
              href={lessonUrl(course, nextSlug)}
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
        </>
      }
    />
  );
}
