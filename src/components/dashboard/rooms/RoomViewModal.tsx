"use client";

import { useEffect, useState } from "react";
import { BedDouble, DoorOpen, Tag, X } from "lucide-react";
import { formatCurrency } from "@/components/dashboard/format";
import { siteImageUrl } from "@/lib/vehicles/image";

export interface RoomViewData {
  id: string;
  roomNo: string;
  type: string;
  description: string;
  price: number;
  imageUrls: string[];
}

interface RoomViewModalProps {
  room: RoomViewData | null;
  onClose: () => void;
}

export default function RoomViewModal({ room, onClose }: RoomViewModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [room?.id]);

  if (!room) return null;

  const images = room.imageUrls.length > 0 ? room.imageUrls : [];
  const activeImage = images[activeIndex] ?? images[0] ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F13] shadow-2xl animate-fade-in">
        <div className="relative h-64 sm:h-72">
          {activeImage ? (
            <img
              src={siteImageUrl(activeImage)}
              alt={room.type}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
              No photo
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-zinc-700 bg-black/70 p-2 text-zinc-300 transition hover:text-rose-400"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-4 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <DoorOpen className="h-6 w-6 text-gold-400" /> Room {room.roomNo}
            </h2>
          </div>
        </div>

        {images.length > 1 ? (
          <div className="flex gap-2 border-b border-zinc-800 bg-[#131316] px-4 py-3">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveIndex(i)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === activeIndex
                    ? "border-gold-500"
                    : "border-zinc-800 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={siteImageUrl(img)}
                  alt={`${room.type} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-zinc-300">
              <BedDouble className="h-3 w-3 text-gold-500" />
              {room.type}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-zinc-300">
              <DoorOpen className="h-3 w-3 text-gold-500" /> No. {room.roomNo}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Price per night
            </p>
            <p className="mt-1 text-2xl font-bold text-gold-400">
              {room.price > 0 ? formatCurrency(room.price) : "Custom quote"}
            </p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <Tag className="h-3.5 w-3.5" /> Description
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {room.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}