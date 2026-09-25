"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import RoomForm, {
  type RoomFormData,
} from "@/components/dashboard/rooms/RoomForm";

export default function EditRoomPage() {
  const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<RoomFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/rooms/${params.id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Failed to load room");
        if (!cancelled) {
          setRoom({
            id: json.room.id,
            roomNo: json.room.roomNo,
            type: json.room.type,
            description: json.room.description,
            price: json.room.price,
            imageUrls: json.room.imageUrls || [],
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load room."
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error || "Room not found."}
      </div>
    );
  }

  return <RoomForm mode="edit" initial={room} />;
}