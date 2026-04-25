"use client";

import { CheckCheck } from "lucide-react";
import { useTransition } from "react";
import { markAllNotificationsAsReadAction } from "@/actions/notifications";
import { Button } from "@/components/ui/button";

type Props = {
  disabled: boolean;
};

export function MarkAllAsReadButton({ disabled }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction({});
    });
  };

  return (
    <Button
      disabled={disabled || isPending}
      onClick={onClick}
      size="sm"
      type="button"
      variant="outline"
    >
      <CheckCheck aria-hidden="true" />
      すべて既読にする
    </Button>
  );
}
