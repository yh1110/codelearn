import { Badge } from "@/components/ui/badge";

export function PublishBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) {
    return (
      <Badge
        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        variant="secondary"
      >
        公開
      </Badge>
    );
  }
  return (
    <Badge className="text-zinc-500" variant="outline">
      非公開
    </Badge>
  );
}
