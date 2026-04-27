import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function OfficialBadge({ className, size = "md" }: Props) {
  const isSm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold tracking-tight",
        isSm ? "px-1.5 py-0.5 text-[10.5px]" : "px-2 py-0.5 text-[11px]",
        className,
      )}
      style={{
        background: "var(--accent-soft)",
        color: "var(--accent-solid)",
        border: "1px solid var(--accent-line, var(--accent-solid))",
      }}
      title="公式コンテンツ"
    >
      <ShieldCheck aria-hidden="true" className={isSm ? "size-2.5" : "size-3"} />
      公式
    </span>
  );
}
