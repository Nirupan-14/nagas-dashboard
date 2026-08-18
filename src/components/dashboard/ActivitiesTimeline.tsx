"use client";

import { useMemo } from "react";
import {
  CalendarCheck,
  ConciergeBell,
  CreditCard,
  LogIn,
  LogOut,
  PartyPopper,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { DashboardActivity } from "@/lib";
import { formatCompact, formatTime } from "@/components/dashboard/format";

const TYPE_META: Record<
  string,
  { icon: typeof Sparkles; styles: string }
> = {
  "check-in": {
    icon: LogIn,
    styles: "text-emerald-400 bg-emerald-500/10",
  },
  "check-out": {
    icon: LogOut,
    styles: "text-sky-400 bg-sky-500/10",
  },
  payment: {
    icon: CreditCard,
    styles: "text-gold-400 bg-gold-500/10",
  },
  booking: {
    icon: CalendarCheck,
    styles: "text-violet-400 bg-violet-500/10",
  },
  dining: {
    icon: Utensils,
    styles: "text-orange-400 bg-orange-500/10",
  },
  spa: {
    icon: Sparkles,
    styles: "text-pink-400 bg-pink-500/10",
  },
  event: {
    icon: PartyPopper,
    styles: "text-cyan-400 bg-cyan-500/10",
  },
};

interface ActivitiesTimelineProps {
  activities: DashboardActivity[];
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ActivitiesTimeline({
  activities,
}: ActivitiesTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, DashboardActivity[]>();
    for (const activity of activities) {
      const key = dayKey(activity.time);
      const list = map.get(key) || [];
      list.push(activity);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="admin-card p-12 text-center text-sm text-zinc-500">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {groups.map(([label, items]) => (
        <section key={label}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300">
              {label}
            </h2>
            <span className="h-px flex-1 bg-zinc-800" />
            <span className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">
              {items.length}
            </span>
          </div>

          <div className="admin-card p-5 sm:p-6">
            <ol className="relative space-y-1">
              {items.map((activity, index) => {
                const meta = TYPE_META[activity.type] || {
                  icon: ConciergeBell,
                  styles: "text-zinc-400 bg-zinc-500/10",
                };
                const Icon = meta.icon;
                const isLast = index === items.length - 1;
                return (
                  <li key={activity.id} className="relative flex gap-3.5 py-2.5">
                    {!isLast ? (
                      <span className="absolute left-[1.06rem] top-11 h-[calc(100%-2.75rem)] w-px bg-zinc-800" />
                    ) : null}
                    <span
                      className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.styles}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p className="truncate text-sm font-semibold text-zinc-100">
                          {activity.title}
                        </p>
                        <span className="shrink-0 text-xs font-medium text-zinc-500">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {activity.description}
                      </p>
                      {activity.bookingRef ? (
                        <p className="mt-0.5 text-xs font-medium text-zinc-600">
                          {activity.bookingRef}
                        </p>
                      ) : null}
                      {activity.amount ? (
                        <p className="mt-1 text-xs font-semibold text-gold-400">
                          {formatCompact(activity.amount)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}
