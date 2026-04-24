"use client";

import { FileText, Pencil } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { togglePublishCourseAction } from "@/actions/dashboard/course";
import { DeleteCourseButton } from "./DeleteCourseButton";
import { PublishBadge } from "./PublishBadge";

type Props = {
  course: {
    id: string;
    slug: string;
    title: string;
    description: string;
    isPublished: boolean;
    lessonCount: number;
  };
};

export function CourseListItem({ course }: Props) {
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    startTransition(async () => {
      await togglePublishCourseAction({
        id: course.id,
        isPublished: !course.isPublished,
      });
    });
  };

  return (
    <article
      className="flex h-full flex-col gap-3 rounded-[14px] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--line-3)]"
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--line-1)",
        minHeight: 180,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/dashboard/courses/${course.id}`}
          className="min-w-0 flex-1 font-semibold text-[15px] leading-snug tracking-tight hover:underline"
          style={{ color: "var(--text-1)" }}
        >
          {course.title}
        </Link>
        <PublishBadge isPublished={course.isPublished} />
      </div>

      {course.description ? (
        <p className="m-0 line-clamp-2 text-[12.5px]" style={{ color: "var(--text-3)" }}>
          {course.description}
        </p>
      ) : null}

      <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--text-3)" }}>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3" aria-hidden="true" />
          <b style={{ color: "var(--text-1)" }}>{course.lessonCount}</b> レッスン
        </span>
        <span className="font-mono text-[11px]" style={{ color: "var(--text-4)" }}>
          /{course.slug}
        </span>
      </div>

      <div
        className="mt-auto flex items-center gap-2 border-t pt-3"
        style={{ borderColor: "var(--line-1)" }}
      >
        <Link
          href={`/dashboard/courses/${course.id}`}
          className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] transition"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--line-2)",
            color: "var(--text-1)",
          }}
        >
          <Pencil className="size-3" aria-hidden="true" /> 編集
        </Link>
        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[12px] transition disabled:opacity-50"
          style={{
            background: course.isPublished ? "var(--bg-2)" : "var(--accent-solid)",
            border: `1px solid ${course.isPublished ? "var(--line-2)" : "transparent"}`,
            color: course.isPublished ? "var(--text-1)" : "var(--accent-ink)",
            fontWeight: course.isPublished ? 500 : 600,
          }}
        >
          {course.isPublished ? "非公開にする" : "公開する"}
        </button>
        <div className="ml-auto">
          <DeleteCourseButton courseId={course.id} title={course.title} />
        </div>
      </div>
    </article>
  );
}
