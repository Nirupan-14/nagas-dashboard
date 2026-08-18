"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, UserRound } from "lucide-react";
import type { DashboardBooking } from "@/lib";
import { StatusBadge } from "@/components/dashboard/Badges";
import { formatCompact, formatDate } from "@/components/dashboard/format";

interface RecentBookingsTableProps {
  bookings: DashboardBooking[];
}

export default function RecentBookingsTable({
  bookings,
}: RecentBookingsTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
              <th className="pb-3 pr-4 font-semibold">Guest</th>
              <th className="pb-3 pr-4 font-semibold">Room</th>
              <th className="pb-3 pr-4 font-semibold">Stay</th>
              <th className="pb-3 pr-4 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No bookings yet.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-zinc-800/60 transition hover:bg-zinc-800/20"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100">
                          {booking.guest.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {booking.bookingRef}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[10rem] py-3.5 pr-4">
                    <p className="truncate text-sm text-zinc-300">
                      {booking.room.label}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {booking.nights} night{booking.nights > 1 ? "s" : ""} ·{" "}
                      {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                      <span className="whitespace-nowrap">
                        {formatDate(booking.checkIn)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        {formatDate(booking.checkOut)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-zinc-100">
                    {formatCompact(booking.amount)}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {bookings.length > 0 ? (
        <div className="mt-4 flex justify-end">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition hover:text-gold-300"
          >
            View all bookings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
