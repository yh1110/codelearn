import {
  HEATMAP_CELL_GAP,
  HEATMAP_CELL_SIZE,
  HEATMAP_DAYS,
  HEATMAP_WEEKS,
  MONTH_LABELS_JA,
} from "@/config/heatmap";

function buildMonthLabels(weekCount = HEATMAP_WEEKS) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  // Treat Monday as start of week. getDay(): Sun=0..Sat=6 → offset to Monday.
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() + offsetToMonday);
  const firstMonday = new Date(lastMonday);
  firstMonday.setDate(lastMonday.getDate() - (weekCount - 1) * 7);

  const labels: { colIndex: number; month: number }[] = [];
  let prevMonth = -1;
  for (let w = 0; w < weekCount; w++) {
    const firstDay = new Date(firstMonday);
    firstDay.setDate(firstMonday.getDate() + w * 7);
    const month = firstDay.getMonth();
    if (month !== prevMonth) {
      // Keep labels at least 2 columns apart to avoid visual crowding.
      if (w === 0 || w - (labels.at(-1)?.colIndex ?? -2) >= 2) {
        labels.push({ colIndex: w, month });
      }
      prevMonth = month;
    }
  }
  return labels;
}

export function Heatmap() {
  const monthLabels = buildMonthLabels();
  const totalCells = HEATMAP_WEEKS * HEATMAP_DAYS;
  const cellStride = HEATMAP_CELL_SIZE + HEATMAP_CELL_GAP;
  const gridWidth = HEATMAP_WEEKS * HEATMAP_CELL_SIZE + (HEATMAP_WEEKS - 1) * HEATMAP_CELL_GAP;
  // Rows (Mon-Sun). Show labels only on Mon/Wed/Fri (rows 0/2/4) to avoid crowding.
  const weekdayLabels = ["月", "", "水", "", "金", "", ""];

  return (
    <div
      className="overflow-x-auto rounded-[14px]"
      style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)" }}
    >
      <div className="p-4" style={{ width: "max-content" }}>
        {/* Month label row */}
        <div className="flex" style={{ marginLeft: 24 }}>
          <div
            className="relative text-[11px]"
            style={{ width: gridWidth, height: 16, color: "var(--text-4)" }}
          >
            {monthLabels.map((ml) => (
              <span
                key={`${ml.colIndex}-${ml.month}`}
                className="absolute top-0 font-mono"
                style={{ left: ml.colIndex * cellStride }}
              >
                {MONTH_LABELS_JA[ml.month]}
              </span>
            ))}
          </div>
        </div>

        {/* Weekday labels + cells */}
        <div className="flex items-start">
          <div
            className="grid font-mono text-[11px]"
            style={{
              width: 24,
              gridTemplateRows: `repeat(${HEATMAP_DAYS}, ${HEATMAP_CELL_SIZE}px)`,
              rowGap: HEATMAP_CELL_GAP,
              color: "var(--text-4)",
            }}
          >
            {weekdayLabels.map((label, idx) => (
              <span
                key={`wd-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: weekday labels are static positional
                  idx
                }`}
                className="flex items-center leading-none"
              >
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid"
            style={{
              gridAutoFlow: "column",
              gridTemplateRows: `repeat(${HEATMAP_DAYS}, ${HEATMAP_CELL_SIZE}px)`,
              gridAutoColumns: `${HEATMAP_CELL_SIZE}px`,
              gap: HEATMAP_CELL_GAP,
            }}
          >
            {Array.from({ length: totalCells }, (_, i) => `cell-${i}`).map((id) => (
              <div key={id} className="cm-heat-cell" />
            ))}
          </div>
        </div>
      </div>
      <div
        className="flex items-center justify-between border-t px-4 py-2.5 text-[12px]"
        style={{ borderColor: "var(--line-1)", color: "var(--text-3)" }}
      >
        <span>活動データは近日公開</span>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-4)" }}>
          少ない
          <span className="cm-heat-cell" />
          <span className="cm-heat-cell cm-heat-1" />
          <span className="cm-heat-cell cm-heat-2" />
          <span className="cm-heat-cell cm-heat-3" />
          <span className="cm-heat-cell cm-heat-4" />
          多い
        </div>
      </div>
    </div>
  );
}
