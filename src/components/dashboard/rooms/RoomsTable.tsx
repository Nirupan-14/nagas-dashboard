"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Eye,
  Loader2,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/components/dashboard/format";
import { siteImageUrl } from "@/lib/vehicles/image";
import RoomViewModal, {
  type RoomViewData,
} from "@/components/dashboard/rooms/RoomViewModal";

export interface RoomRow {
  id: string;
  roomNo: string;
  type: string;
  description: string;
  price: number;
  imageUrls: string[];
}

interface RoomsTableProps {
  rooms: RoomRow[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

const PAGE_SIZE = 8;

export default function RoomsTable({
  rooms,
  isAdmin,
  onDelete,
  deletingId,
}: RoomsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewRoom, setViewRoom] = useState<RoomViewData | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => {
      if (!q) return true;
      return (
        r.roomNo.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [rooms, query]);

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
            placeholder="Search by room number, type or description…"
          />
        </div>
        <span className="hidden text-xs text-zinc-500 sm:block">
          {filtered.length} room{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">Room</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Description</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-16 text-center text-sm text-zinc-500"
                  >
                    No rooms found.
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                          {r.imageUrls[0] ? (
                            <img
                              src={siteImageUrl(r.imageUrls[0])}
                              alt={r.type}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <BedDouble className="h-4 w-4 text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-100">
                            <DoorOpen className="h-3.5 w-3.5 text-gold-500" />
                            {r.roomNo}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {r.imageUrls.length} image
                            {r.imageUrls.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-zinc-300">
                        <BedDouble className="h-3 w-3 text-gold-500" />
                        {r.type}
                      </span>
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">
                        {r.description}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-zinc-100">
                      {r.price > 0 ? formatCurrency(r.price) : "Custom quote"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewRoom(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => router.push(`/rooms/${r.id}/edit`)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
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
                          </>
                        ) : null}
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
            of{" "}
            <span className="font-semibold text-zinc-300">
              {filtered.length}
            </span>{" "}
            rooms
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

      <RoomViewModal room={viewRoom} onClose={() => setViewRoom(null)} />
    </div>
  );
}