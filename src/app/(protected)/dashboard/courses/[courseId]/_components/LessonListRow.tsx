"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePublishLessonAction } from "@/actions/dashboard/lesson";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteLessonButton } from "../../../_components/DeleteLessonButton";
import { PublishBadge } from "../../../_components/PublishBadge";

type Props = {
  courseId: string;
  lesson: {
    id: string;
    slug: string;
    title: string;
    order: number;
    isPublished: boolean;
  };
};

export function LessonListRow({ courseId, lesson }: Props) {
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    startTransition(async () => {
      await togglePublishLessonAction({
        id: lesson.id,
        isPublished: !lesson.isPublished,
      });
    });
  };

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
          #{lesson.order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
              className="truncate font-medium hover:underline"
            >
              {lesson.title}
            </Link>
            <PublishBadge isPublished={lesson.isPublished} />
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">/{lesson.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            disabled={isPending}
            onClick={onToggle}
            size="sm"
            type="button"
            variant={lesson.isPublished ? "outline" : "default"}
          >
            {lesson.isPublished ? "非公開にする" : "公開する"}
          </Button>
          <DeleteLessonButton lessonId={lesson.id} title={lesson.title} />
        </div>
      </CardContent>
    </Card>
  );
}
