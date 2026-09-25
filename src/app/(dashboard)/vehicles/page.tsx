"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Car, Loader2, Plus } from "lucide-react";
import VehiclesTable, {
  type VehicleRow,
} from "@/components/dashboard/vehicles/VehiclesTable";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [vehiclesRes, meRes] = await Promise.all([
          fetch("/api/admin/vehicles", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const vehiclesJson = await vehiclesRes.json();
        const meJson = await meRes.json();
        if (!vehiclesRes.ok)
          throw new Error(vehiclesJson?.error || "Failed to load vehicles");
        if (!cancelled) {
          setVehicles(vehiclesJson.vehicles || []);
          setIsAdmin(meJson?.user?.role === "admin");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load vehicles."
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
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to delete vehicle.");
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
          <Car className="h-4 w-4 text-gold-500" />
          {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} shown on
          the website
        </p>
        {isAdmin ? (
          <Link
            href="/vehicles/new"
            className="gold-bg inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition hover:shadow-[0_8px_30px_rgba(196,154,60,0.35)]"
          >
            <Plus className="h-4 w-4" /> Add vehicle
          </Link>
        ) : null}
      </div>

      <VehiclesTable
        vehicles={vehicles}
        isAdmin={isAdmin}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}