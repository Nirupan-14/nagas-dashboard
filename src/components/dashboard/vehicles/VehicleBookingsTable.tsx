"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import type { DashboardVehicleBooking } from "@/lib";
import {
  MethodBadge,
  SourceBadge,
  StatusBadge,
} from "@/components/dashboard/Badges";
import { formatCurrency, formatDate } from "@/components/dashboard/format";

const PAGE_SIZE = 8;
const STATUSES = ["all", "confirmed", "cancelled"];
const PAYMENT_STATUSES = ["all", "paid", "pending", "failed"];

function formatDateOnly(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface VehicleBookingsTableProps {
  bookings: DashboardVehicleBooking[];
}

export default function VehicleBookingsTable({
  bookings,
}: VehicleBookingsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus = status === "all" || b.status === status;
      const matchesPayment = payment === "all" || b.paymentStatus === payment;
      const matchesQuery =
        !q ||
        b.guest.name.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.vehicle.toLowerCase().includes(q) ||
        b.guest.email.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q);
      return matchesStatus && matchesPayment && matchesQuery;
    });
  }, [bookings, query, status, payment]);

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
            placeholder="Search by guest, vehicle, reference, or destination…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex flex-wrap items-center gap-2">
            {PAYMENT_STATUSES.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPayment(p);
                  resetPage();
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  payment === p
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {p === "all" ? "Any payment" : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">Booking</th>
                <th className="px-5 py-4 font-semibold">Vehicle</th>
                <th className="px-5 py-4 font-semibold">Pickup</th>
                <th className="px-5 py-4 font-semibold">Passenger</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Payment</th>
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
                    No vehicle bookings match your filters.
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
                        {b.vehicle}
                      </p>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.destination}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {b.passengers} passenger
                          {b.passengers > 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm text-zinc-300">
                        {formatDateOnly(b.pickupDate)}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {b.pickupTime}–{b.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300">
                      {b.guest.name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {b.guest.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {b.guest.phone}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-zinc-100">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={b.paymentStatus} />
                        <MethodBadge method={b.paymentMethod} />
                      </div>
                      {b.transactionId ? (
                        <p className="mt-1 max-w-[10rem] truncate text-[0.65rem] text-zinc-600">
                          Txn: {b.transactionId}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={b.status} />
                        <SourceBadge source={b.source} />
                      </div>
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
            vehicle bookings
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