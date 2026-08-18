"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText, Search } from "lucide-react";
import type { DashboardPayment } from "@/lib";
import { MethodBadge, StatusBadge } from "@/components/dashboard/Badges";
import {
  formatCurrency,
  formatDateTime,
  formatTime,
} from "@/components/dashboard/format";

const PAGE_SIZE = 8;
const STATUSES = ["all", "paid", "pending", "refunded", "failed"];

interface PaymentsTableProps {
  payments: DashboardPayment[];
}

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesStatus = status === "all" || p.status === status;
      const matchesQuery =
        !q ||
        p.guest.toLowerCase().includes(q) ||
        p.paymentRef.toLowerCase().includes(q) ||
        p.bookingRef.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [payments, query, status]);

  const totalCollected = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );
  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Total collected
          </p>
          <p className="mt-1.5 text-xl font-bold text-emerald-400">
            {formatCurrency(totalCollected)}
          </p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Outstanding
          </p>
          <p className="mt-1.5 text-xl font-bold text-amber-400">
            {formatCurrency(totalPending)}
          </p>
        </div>
        <div className="admin-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Transactions
          </p>
          <p className="mt-1.5 text-xl font-bold text-zinc-100">
            {payments.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="admin-input pl-10"
            placeholder="Search by guest, payment ref, or booking ref…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
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
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Guest</th>
                <th className="px-5 py-4 font-semibold">Booking</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Method</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-zinc-500"
                  >
                    No payments match your filters.
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400">
                          <ReceiptText className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gold-400">
                            {p.paymentRef}
                          </p>
                          <p className="max-w-[9rem] truncate text-xs text-zinc-500">
                            {p.transactionId || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-100">
                        {p.guest}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-zinc-400">{p.bookingRef}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-zinc-100">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <MethodBadge method={p.method} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm text-zinc-400">
                        {formatDateTime(p.paidAt)}
                      </p>
                      <p className="text-xs text-zinc-600">
                        {formatTime(p.paidAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
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
            payments
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
