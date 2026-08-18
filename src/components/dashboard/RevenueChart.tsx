"use client";

import { useState } from "react";
import { formatCompact } from "@/components/dashboard/format";

interface RevenueChartProps {
  data: { label: string; value: number }[];
}

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 24;
const PAD_BOTTOM = 26;

export default function RevenueChart({ data }: RevenueChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = chartWidth / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: PAD_LEFT + i * step,
    y: PAD_TOP + chartHeight - (d.value / max) * chartHeight,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${
    PAD_TOP + chartHeight
  } L${points[0]?.x ?? 0},${PAD_TOP + chartHeight} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Revenue by day chart"
        >
          <defs>
            <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49A3C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#C49A3C" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B6914" />
              <stop offset="50%" stopColor="#C49A3C" />
              <stop offset="100%" stopColor="#D4AF6A" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => {
            const y = PAD_TOP + chartHeight - g * chartHeight;
            return (
              <g key={g}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={WIDTH - PAD_RIGHT}
                  y2={y}
                  stroke="#26262B"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
                <text
                  x={WIDTH - PAD_RIGHT - 4}
                  y={y - 4}
                  textAnchor="end"
                  className="fill-zinc-600 text-[9px]"
                >
                  {formatCompact(max * g)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#areaGold)" />
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - step / 2}
                y={PAD_TOP}
                width={step}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 5 : 3}
                fill={hoverIndex === i ? "#D4AF6A" : "#C49A3C"}
                stroke="#0A0A0D"
                strokeWidth="2"
                className="transition-all"
              />
              <text
                x={p.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                className={`fill-zinc-600 text-[9px] ${
                  hoverIndex === i ? "fill-gold-400 font-semibold" : ""
                }`}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {hoverIndex !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-gold-500/30 bg-[#1F1F24] px-3 py-2 text-center shadow-xl shadow-black/50"
            style={{
              left: `${(points[hoverIndex].x / WIDTH) * 100}%`,
              top: `${(points[hoverIndex].y / HEIGHT) * 100 - 12}%`,
            }}
          >
            <p className="whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-400">
              {points[hoverIndex].label}
            </p>
            <p className="whitespace-nowrap text-sm font-bold text-gold-400">
              {formatCompact(points[hoverIndex].value)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-3 text-[0.7rem] text-zinc-600">
        <span>Last 14 days</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold-500" />
          Daily revenue
        </span>
      </div>
    </div>
  );
}
