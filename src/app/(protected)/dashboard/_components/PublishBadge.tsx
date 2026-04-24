import { cn } from "@/lib/utils";

export function PublishBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={cn("cm-status-pill", isPublished ? "cm-status-pill-pub" : "cm-status-pill-draft")}
    >
      {isPublished ? "公開中" : "下書き"}
    </span>
  );
}
