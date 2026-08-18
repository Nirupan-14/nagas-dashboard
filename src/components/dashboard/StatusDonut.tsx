"use client";

interface StatusDonutProps {
  counts: Record<string, number>;
}

const SEGMENT_COLORS: Record<string, string> = {
  confirmed: "#38BDF8",
  pending: "#FBBF24",
  "checked-in": "#34D399",
  "checked-out": "#71717A",
  cancelled: "#FB7185",
};

const SEGMENT_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
};

const RADIUS = 62;

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = {
    x: cx + r * Math.cos((startAngle - 90) * (Math.PI / 180)),
    y: cy + r * Math.sin((startAngle - 90) * (Math.PI / 180)),
  };
  const end = {
    x: cx + r * Math.cos((endAngle - 90) * (Math.PI / 180)),
    y: cy + r * Math.sin((endAngle - 90) * (Math.PI / 180)),
  };
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function StatusDonut({ counts }: StatusDonutProps) {
  const entries = Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
  );
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  const segments = entries.reduce<
    { status: string; value: number; fraction: number; start: number; end: number }[]
  >((acc, [status, value]) => {
    const fraction = total > 0 ? value / total : 0;
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    const end = start + fraction * 360;
    acc.push({ status, value, fraction, start, end });
    return acc;
  }, []);

  const topStatus = segments[0];

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div className="relative h-44 w-44 shrink-0">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={RADIUS}
            fill="none"
            stroke="#18181C"
            strokeWidth="16"
          />
          {segments.map((seg) => {
            if (seg.fraction <= 0) return null;
            const color = SEGMENT_COLORS[seg.status] || "#71717A";
            return (
              <path
                key={seg.status}
                d={describeArc(80, 80, RADIUS, seg.start, seg.end)}
                fill="none"
                stroke={color}
                strokeWidth="16"
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-zinc-50">{total}</p>
          <p className="text-[0.65rem] uppercase tracking-widest text-zinc-500">
            bookings
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 flex-1 space-y-2.5">
        {segments.map((seg) => {
          const color = SEGMENT_COLORS[seg.status] || "#71717A";
          return (
            <div key={seg.status} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="flex-1 truncate text-sm text-zinc-300">
                {SEGMENT_LABELS[seg.status] || seg.status}
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {seg.value}
              </span>
              <span className="w-12 text-right text-xs text-zinc-500">
                {Math.round(seg.fraction * 100)}%
              </span>
            </div>
          );
        })}
        {total === 0 ? (
          <p className="text-sm text-zinc-500">No bookings yet.</p>
        ) : null}
        {topStatus ? (
          <div className="pt-2">
            <p className="text-xs text-zinc-500">
              Most common:{" "}
              <span className="font-semibold text-zinc-300">
                {SEGMENT_LABELS[topStatus.status] || topStatus.status}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
