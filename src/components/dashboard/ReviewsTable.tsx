"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/components/dashboard/format";

export interface ReviewRow {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  createdAt: string;
}

interface ReviewsTableProps {
  reviews: ReviewRow[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

const PAGE_SIZE = 8;

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < count
              ? "fill-gold-400 text-gold-400"
              : "fill-zinc-700 text-zinc-700"
          }`}
        />
      ))}
    </span>
  );
}

export default function ReviewsTable({
  reviews,
  isAdmin,
  onDelete,
  deletingId,
}: ReviewsTableProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.quote.toLowerCase().includes(q)
      );
    });
  }, [reviews, query]);

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
            placeholder="Search by name, role, or review text…"
          />
        </div>
        <span className="hidden text-xs text-zinc-500 sm:block">
          {filtered.length} review{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">Reviewer</th>
                <th className="px-5 py-4 font-semibold">Review</th>
                <th className="px-5 py-4 font-semibold">Rating</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                {isAdmin ? (
                  <th className="px-5 py-4 font-semibold text-right">Action</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 5 : 4}
                    className="px-5 py-16 text-center text-sm text-zinc-500"
                  >
                    No reviews found.
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-zinc-100">
                        {r.name}
                      </p>
                      <p className="text-xs text-zinc-500">{r.role}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm leading-relaxed text-zinc-300 line-clamp-3">
                        {r.quote}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Stars count={r.rating} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                      {formatDate(r.createdAt)}
                    </td>
                    {isAdmin ? (
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => onDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/25 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-50"
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </td>
                    ) : null}
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
            of{" "}
            <span className="font-semibold text-zinc-300">
              {filtered.length}
            </span>{" "}
            reviews
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