"use client";

import Link from "next/link";
import { useTransition } from "react";
import { togglePublishProblemAction } from "@/actions/dashboard/problem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteProblemButton } from "../../../_components/DeleteProblemButton";
import { PublishBadge } from "../../../_components/PublishBadge";

type Props = {
  collectionId: string;
  problem: {
    id: string;
    slug: string;
    title: string;
    order: number;
    isPublished: boolean;
  };
};

export function ProblemListRow({ collectionId, problem }: Props) {
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    startTransition(async () => {
      await togglePublishProblemAction({
        id: problem.id,
        isPublished: !problem.isPublished,
      });
    });
  };

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-4">
        <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
          #{problem.order}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/collections/${collectionId}/problems/${problem.id}`}
              className="truncate font-medium hover:underline"
            >
              {problem.title}
            </Link>
            <PublishBadge isPublished={problem.isPublished} />
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">/{problem.slug}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            disabled={isPending}
            onClick={onToggle}
            size="sm"
            type="button"
            variant={problem.isPublished ? "outline" : "default"}
          >
            {problem.isPublished ? "非公開にする" : "公開する"}
          </Button>
          <DeleteProblemButton problemId={problem.id} title={problem.title} />
        </div>
      </CardContent>
    </Card>
  );
}
