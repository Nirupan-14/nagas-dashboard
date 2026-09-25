"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BedDouble, Loader2, Plus } from "lucide-react";
import RoomsTable, {
  type RoomRow,
} from "@/components/dashboard/rooms/RoomsTable";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [roomsRes, meRes] = await Promise.all([
          fetch("/api/admin/rooms", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const roomsJson = await roomsRes.json();
        const meJson = await meRes.json();
        if (!roomsRes.ok)
          throw new Error(roomsJson?.error || "Failed to load rooms");
        if (!cancelled) {
          setRooms(roomsJson.rooms || []);
          setIsAdmin(meJson?.user?.role === "admin");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load rooms."
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this room?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to delete room.");
    }
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
          <BedDouble className="h-4 w-4 text-gold-500" />
          {rooms.length} room{rooms.length === 1 ? "" : "s"} in the fleet
        </p>
        {isAdmin ? (
          <Link
            href="/rooms/new"
            className="gold-bg inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition hover:shadow-[0_8px_30px_rgba(196,154,60,0.35)]"
          >
            <Plus className="h-4 w-4" /> Add room
          </Link>
        ) : null}
      </div>

      <RoomsTable
        rooms={rooms}
        isAdmin={isAdmin}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}