"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteLessonAction } from "@/actions/dashboard/lesson";
import { Button } from "@/components/ui/button";

type Props = {
  lessonId: string;
  title: string;
};

export function DeleteLessonButton({ lessonId, title }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (!window.confirm(`レッスン「${title}」を削除しますか？`)) {
      return;
    }
    startTransition(async () => {
      await deleteLessonAction({ id: lessonId });
    });
  };

  return (
    <Button
      aria-label={`レッスン「${title}」を削除`}
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
