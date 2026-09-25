"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Car,
  CircleDollarSign,
  Loader2,
  CalendarClock,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import VehicleBookingsTable from "@/components/dashboard/vehicles/VehicleBookingsTable";
import VehicleAvailabilityCalendar from "@/components/dashboard/vehicles/VehicleAvailabilityCalendar";
import { formatCompact } from "@/components/dashboard/format";
import type { DashboardVehicleBooking } from "@/lib";

interface FleetVehicle {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface VehicleBookingsData {
  bookings: DashboardVehicleBooking[];
  bookedByVehicle: Record<string, string[]>;
  vehicles: FleetVehicle[];
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function VehicleBookingsPage() {
  const [data, setData] = useState<VehicleBookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/bookings/vehicles", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load vehicle bookings");
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load vehicle bookings.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!data) return null;
    const { bookings } = data;
    const total = bookings.length;
    const paid = bookings.filter((b) => b.paymentStatus === "paid");
    const paidAmount = paid.reduce((sum, b) => sum + b.amount, 0);
    const pendingCount = bookings.filter((b) => b.paymentStatus !== "paid").length;
    const upcoming = bookings.filter(
      (b) => b.pickupDate >= todayKey() && b.status !== "cancelled"
    ).length;
    return { total, paidCount: paid.length, paidAmount, pendingCount, upcoming };
  }, [data]);

  const vehicleOptions = useMemo(() => {
    if (!data) return [];
    const names = new Set<string>(
      data.vehicles.map((v) => v.name)
    );
    for (const b of data.bookings) names.add(b.vehicle);
    return Array.from(names).sort();
  }, [data]);

  const selectedBookedDates = useMemo(() => {
    if (!data) return [];
    if (selectedVehicle === "all") {
      const set = new Set<string>();
      for (const dates of Object.values(data.bookedByVehicle)) {
        for (const d of dates) set.add(d);
      }
      return Array.from(set).sort();
    }
    return data.bookedByVehicle[selectedVehicle] || [];
  }, [data, selectedVehicle]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error || !data || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error || "Vehicle bookings are unavailable."}
      </div>
    );
  }

  const { bookings } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Vehicle bookings</h1>
          <p className="text-sm text-zinc-400">
            Transfers reserved plus PayPal payments collected from the website.
          </p>
        </div>
        <a
          href="http://localhost:3000/reserve/vehicle"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-gold-500/40 hover:text-gold-300"
        >
          <Car className="h-4 w-4" />
          View booking page
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total vehicle bookings"
          value={String(stats.total)}
          sub={`${stats.upcoming} upcoming pickups`}
          icon={Car}
          accent="gold"
        />
        <StatCard
          label="Paid via PayPal"
          value={String(stats.paidCount)}
          sub={formatCompact(stats.paidAmount)}
          icon={CircleDollarSign}
          accent="emerald"
        />
        <StatCard
          label="Pending payment"
          value={String(stats.pendingCount)}
          sub="pay at pickup"
          icon={Banknote}
          accent="amber"
        />
        <StatCard
          label="Upcoming pickups"
          value={String(stats.upcoming)}
          sub="not yet departed"
          icon={CalendarClock}
          accent="sky"
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VehicleBookingsTable bookings={bookings} />
        </div>

        <div className="space-y-4">
          <div className="admin-card space-y-3">
            <p className="text-sm font-bold text-zinc-100">Show calendar for</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedVehicle("all")}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedVehicle === "all"
                    ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                All vehicles
              </button>
              {vehicleOptions.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedVehicle(name)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedVehicle === name
                      ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <VehicleAvailabilityCalendar bookedDates={selectedBookedDates} />
        </div>
      </div>
    </div>
  );
}