import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  delta?: number;
  accent?: "gold" | "emerald" | "sky" | "rose" | "violet";
}

const ACCENTS: Record<string, { bg: string; text: string; ring: string }> = {
  gold: {
    bg: "bg-gold-500/10",
    text: "text-gold-400",
    ring: "group-hover:border-gold-500/40",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "group-hover:border-emerald-500/40",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    ring: "group-hover:border-sky-500/40",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    ring: "group-hover:border-rose-500/40",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    ring: "group-hover:border-violet-500/40",
  },
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  accent = "gold",
}: StatCardProps) {
  const style = ACCENTS[accent];
  const positive = (delta ?? 0) >= 0;

  return (
    <div
      className={`admin-card group p-5 transition ${style.ring} animate-fade-up`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-zinc-50">
            {value}
          </p>
          {sub ? (
            <p className="mt-1 truncate text-xs text-zinc-500">{sub}</p>
          ) : null}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      {delta !== undefined ? (
        <div
          className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(delta).toFixed(1)}%
          <span className="font-normal text-zinc-600">vs last week</span>
        </div>
      ) : null}
    </div>
  );
}
