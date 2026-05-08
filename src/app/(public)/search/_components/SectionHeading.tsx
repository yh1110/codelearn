type SectionHeadingProps = {
  id: string;
  label: string;
  count: number;
};

export function SectionHeading({ id, label, count }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className="m-0 flex items-baseline gap-2 font-semibold text-[15px] tracking-tight"
      style={{ color: "var(--text-1)" }}
    >
      {label}
      <span className="cm-mono font-normal text-[12px]" style={{ color: "var(--text-3)" }}>
        {count} 件
      </span>
    </h2>
  );
}
