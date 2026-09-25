"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import VehicleForm, {
  type VehicleFormData,
} from "@/components/dashboard/vehicles/VehicleForm";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/admin/vehicles/${params.id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Failed to load vehicle");
        if (!cancelled) {
          setVehicle({
            id: json.vehicle.id,
            name: json.vehicle.name,
            description: json.vehicle.description,
            price: json.vehicle.price,
            imageUrl: json.vehicle.imageUrl,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load vehicle."
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

  if (error || !vehicle) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error || "Vehicle not found."}
      </div>
    );
  }

  return <VehicleForm mode="edit" initial={vehicle} />;
}