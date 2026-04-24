"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteCourseAction } from "@/actions/dashboard/course";
import { Button } from "@/components/ui/button";

type Props = {
  courseId: string;
  title: string;
};

export function DeleteCourseButton({ courseId, title }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm(`コース「${title}」を削除しますか？\nレッスンも一緒に削除されます。`)) {
      return;
    }
    startTransition(async () => {
      await deleteCourseAction({ id: courseId });
    });
  };

  return (
    <Button
      aria-label={`コース「${title}」を削除`}
      disabled={isPending}
      onClick={onClick}
      size="icon-sm"
      type="button"
      variant="destructive"
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
}
