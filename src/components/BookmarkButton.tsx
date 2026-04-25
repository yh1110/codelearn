"use client";

import { Star } from "lucide-react";
import { useTransition } from "react";
import { toggleCourseBookmarkAction, toggleLessonBookmarkAction } from "@/actions/bookmarks";
import { cn } from "@/lib/utils";

type Props = ({ target: "course"; courseId: string } | { target: "lesson"; lessonId: string }) & {
  bookmarked: boolean;
  variant?: "default" | "compact";
};

export function BookmarkButton(props: Props) {
  const { bookmarked, variant = "default" } = props;
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      if (props.target === "course") {
        await toggleCourseBookmarkAction({ courseId: props.courseId });
      } else {
        await toggleLessonBookmarkAction({ lessonId: props.lessonId });
      }
    });
  };

  const label = bookmarked ? "お気に入り解除" : "お気に入りに追加";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        aria-pressed={bookmarked}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-[10px] transition",
          isPending && "opacity-60",
        )}
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--line-2)",
          color: bookmarked ? "var(--accent-solid)" : "var(--text-2)",
        }}
      >
        <Star className="size-4" aria-hidden="true" fill={bookmarked ? "currentColor" : "none"} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={bookmarked}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[13px] transition",
        isPending && "opacity-60",
      )}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line-2)",
        color: bookmarked ? "var(--accent-solid)" : "var(--text-1)",
      }}
    >
      <Star className="size-3.5" aria-hidden="true" fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "お気に入り済み" : "お気に入り"}
    </button>
  );
}
