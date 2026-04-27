import type { ReactNode } from "react";

type StatProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
};

export function Stat({ icon, label, value, unit, sub }: StatProps) {
  return (
    <div
      className="rounded-[14px] p-4"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div
        className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em]"
        style={{ color: "var(--text-4)", fontWeight: 600 }}
      >
        {icon}
        {label}
      </div>
      <div
        className="font-semibold text-[28px] tracking-tight"
        style={{ fontFamily: "var(--font-mono-family)" }}
      >
        {value}
        {unit ? (
          <span className="text-[14px]" style={{ color: "var(--text-3)" }}>
            {unit}
          </span>
        ) : null}
      </div>
      {sub ? (
        <div className="mt-1 font-mono text-[11.5px]" style={{ color: "var(--text-3)" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}
