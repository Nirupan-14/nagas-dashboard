"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import type { DashboardBooking } from "@/lib";
import {
  SourceBadge,
  StatusBadge,
} from "@/components/dashboard/Badges";
import { formatCurrency, formatDate } from "@/components/dashboard/format";

const PAGE_SIZE = 8;
const STATUSES = [
  "all",
  "confirmed",
  "pending",
  "checked-in",
  "checked-out",
  "cancelled",
];

interface BookingsTableProps {
  bookings: DashboardBooking[];
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = status === "all" || b.status === status;
      const matchesQuery =
        !q ||
        b.guest.name.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.room.label.toLowerCase().includes(q) ||
        b.guest.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            className="admin-input pl-10"
            placeholder="Search by guest, reference, or room…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                resetPage();
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                status === s
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">Booking</th>
                <th className="px-5 py-4 font-semibold">Guest</th>
                <th className="px-5 py-4 font-semibold">Room</th>
                <th className="px-5 py-4 font-semibold">Check-in</th>
                <th className="px-5 py-4 font-semibold">Check-out</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Source</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-zinc-500"
                  >
                    No bookings match your filters.
                  </td>
                </tr>
              ) : (
                visible.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-gold-400">
                        {b.bookingRef}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(b.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-100">
                        {b.guest.name}
                      </p>
                      <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {b.guest.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {b.guest.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-zinc-300">{b.room.label}</p>
                      <p className="text-xs text-zinc-500">
                        {b.nights} night{b.nights > 1 ? "s" : ""} · {b.guests} guest
                        {b.guests > 1 ? "s" : ""}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                      {formatDate(b.checkIn)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                      {formatDate(b.checkOut)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-zinc-100">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <SourceBadge source={b.source} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3.5">
          <p className="text-xs text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-300">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-zinc-300">{filtered.length}</span>{" "}
            bookings
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-zinc-400">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
