"use client";

import { Car, MapPin, ShieldCheck, Tag, X } from "lucide-react";
import { formatCurrency } from "@/components/dashboard/format";
import { siteImageUrl } from "@/lib/vehicles/image";

export interface VehicleViewData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface VehicleViewModalProps {
  vehicle: VehicleViewData | null;
  onClose: () => void;
}

export default function VehicleViewModal({
  vehicle,
  onClose,
}: VehicleViewModalProps) {
  if (!vehicle) return null;

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
          <img
            src={siteImageUrl(vehicle.imageUrl)}
            alt={vehicle.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full border border-zinc-700 bg-black/70 p-2 text-zinc-300 transition hover:text-rose-400"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-4 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <Car className="h-6 w-6 text-gold-400" /> {vehicle.name}
            </h2>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-zinc-300">
              <ShieldCheck className="h-3 w-3 text-gold-500" />
              {vehicle.slug}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[0.7rem] font-medium text-zinc-300">
              <MapPin className="h-3 w-3 text-gold-500" /> Nagas Resort transfer
              fleet
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Price per journey
              </p>
              <p className="mt-1 text-2xl font-bold text-gold-400">
                {vehicle.price > 0
                  ? formatCurrency(vehicle.price)
                  : "Custom quote"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              <Tag className="h-3.5 w-3.5" /> Description
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {vehicle.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}