"use client";

import Link from "next/link";
import {
  ArrowRight,
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

interface TodayActivitiesProps {
  activities: DashboardActivity[];
  limit?: number;
  showAllLink?: boolean;
}

export default function TodayActivities({
  activities,
  limit = 6,
  showAllLink = true,
}: TodayActivitiesProps) {
  const visible = activities.slice(0, limit);

  return (
    <div>
      <ol className="relative space-y-1">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            No activities recorded today.
          </p>
        ) : (
          visible.map((activity, index) => {
            const meta = TYPE_META[activity.type] || {
              icon: ConciergeBell,
              styles: "text-zinc-400 bg-zinc-500/10",
            };
            const Icon = meta.icon;
            const isLast = index === visible.length - 1;
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
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {activity.description}
                  </p>
                  {activity.amount ? (
                    <p className="mt-1 text-xs font-semibold text-gold-400">
                      {formatCompact(activity.amount)}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ol>

      {showAllLink && activities.length > 0 ? (
        <div className="mt-3 flex justify-end border-t border-zinc-800 pt-3">
          <Link
            href="/activities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition hover:text-gold-300"
          >
            View all activity <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
