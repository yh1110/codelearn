"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePublishCourseAction } from "@/actions/dashboard/course";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/courses/${course.id}`}
              className="truncate font-semibold hover:underline"
            >
              {course.title}
            </Link>
            <PublishBadge isPublished={course.isPublished} />
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            /{course.slug} · レッスン {course.lessonCount} 件
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={onToggle}
            disabled={isPending}
            size="sm"
            type="button"
            variant={course.isPublished ? "outline" : "default"}
          >
            {course.isPublished ? "非公開にする" : "公開する"}
          </Button>
          <DeleteCourseButton courseId={course.id} title={course.title} />
        </div>
      </CardContent>
    </Card>
  );
}
