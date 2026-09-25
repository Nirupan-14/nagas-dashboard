"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Lock } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const startOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

interface VehicleAvailabilityCalendarProps {
  bookedDates: string[];
}

export default function VehicleAvailabilityCalendar({
  bookedDates,
}: VehicleAvailabilityCalendarProps) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);

  const cells = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0
    ).getDate();
    const list: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return list;
  }, [viewDate]);

  const canGoPrev =
    viewDate.getFullYear() > today.getFullYear() ||
    viewDate.getMonth() > today.getMonth();

  const upcomingBooked = bookedDates
    .filter((d) => `${d}T00:00:00` >= `${today.toISOString().slice(0, 10)}T00:00:00`)
    .sort();

  return (
    <div className="admin-card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Date availability</h3>
          <p className="text-xs text-zinc-500">
            Blocked dates are already booked and cannot be reserved again.
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
          <CalendarDays className="h-4 w-4" />
        </span>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            canGoPrev &&
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
          }
          disabled={!canGoPrev}
          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-bold text-zinc-200">
          {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
          }
          className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500"
          >
            {day}
          </span>
        ))}
        {cells.map((date, idx) => {
          if (!date) return <span key={`empty-${idx}`} />;
          const key = dateKey(date);
          const isPast = date.getTime() < today.getTime();
          const isBooked = bookedSet.has(key);
          return (
            <span
              key={key}
              title={isBooked ? "Booked (blocked)" : isPast ? "Past date" : "Available"}
              className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium ${
                isBooked
                  ? "bg-rose-500/15 text-rose-400"
                  : isPast
                    ? "text-zinc-700"
                    : "bg-zinc-800/60 text-zinc-300"
              }`}
            >
              {isBooked ? (
                <Lock className="h-3 w-3" />
              ) : (
                date.getDate()
              )}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-zinc-800/60" />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded bg-rose-500/20 text-rose-400">
            <Lock className="h-2 w-2" />
          </span>
          Booked (blocked)
        </span>
      </div>

      {upcomingBooked.length > 0 ? (
        <div className="border-t border-zinc-800 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Upcoming blocked dates
          </p>
          <div className="flex flex-wrap gap-1.5">
            {upcomingBooked.slice(0, 14).map((d) => (
              <span
                key={d}
                className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-rose-300"
              >
                {d}
              </span>
            ))}
            {upcomingBooked.length > 14 ? (
              <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-[0.65rem] text-zinc-500">
                +{upcomingBooked.length - 14} more
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}