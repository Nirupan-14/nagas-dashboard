"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BedDouble,
  CalendarCheck,
  CircleDollarSign,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatusDonut from "@/components/dashboard/StatusDonut";
import RecentBookingsTable from "@/components/dashboard/RecentBookingsTable";
import TodayActivities from "@/components/dashboard/TodayActivities";
import {
  formatCompact,
  formatCurrency,
  todayLabel,
} from "@/components/dashboard/format";
import type {
  DashboardActivity,
  DashboardBooking,
} from "@/lib";

interface OverviewData {
  stats: {
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueGrowth: number;
    totalBookings: number;
    activeBookings: number;
    todayCheckins: number;
    todayCheckouts: number;
    occupancyRate: number;
    inHouseNow: number;
    avgBookingValue: number;
    pendingAmount: number;
    pendingCount: number;
  };
  revenueByDay: { label: string; value: number }[];
  statusCounts: Record<string, number>;
  recentBookings: DashboardBooking[];
  todayActivities: DashboardActivity[];
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="skeleton h-80 rounded-2xl xl:col-span-2" />
        <div className="skeleton h-80 rounded-2xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="skeleton h-96 rounded-2xl xl:col-span-2" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load data");
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <OverviewSkeleton />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center">
        <p className="text-sm text-rose-300">
          {error || "Dashboard data is unavailable."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-gold-500/40 hover:text-gold-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm text-zinc-400">
            Welcome back — here&apos;s what&apos;s happening at the resort today.
          </h2>
          <p className="mt-1 text-xs text-zinc-600">{todayLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <Activity className="h-3.5 w-3.5" />
            {stats.inHouseNow} in-house
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Occupancy {stats.occupancyRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          sub={`${stats.pendingCount} pending · ${formatCompact(stats.pendingAmount)}`}
          icon={CircleDollarSign}
          delta={stats.revenueGrowth}
          accent="gold"
        />
        <StatCard
          label="Revenue today"
          value={formatCurrency(stats.revenueToday)}
          sub={`Avg booking value ${formatCompact(stats.avgBookingValue)}`}
          icon={Wallet}
          accent="emerald"
        />
        <StatCard
          label="Total bookings"
          value={String(stats.totalBookings)}
          sub={`${stats.activeBookings} active`}
          icon={CalendarCheck}
          accent="sky"
        />
        <StatCard
          label="Today's check-ins / outs"
          value={`${stats.todayCheckins} / ${stats.todayCheckouts}`}
          sub={`${stats.inHouseNow} guests in-house`}
          icon={Users}
          accent="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="admin-card p-5 sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Revenue overview</h3>
              <p className="text-xs text-zinc-500">Daily revenue · last 14 days</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#18181C] px-3 py-1 text-xs font-medium text-zinc-400">
              <CircleDollarSign className="h-3.5 w-3.5 text-gold-500" />
              {formatCompact(stats.revenueThisWeek ?? 0)}
            </span>
          </div>
          <RevenueChart data={data.revenueByDay} />
        </div>

        <div className="admin-card p-5 sm:p-6">
          <h3 className="text-sm font-bold text-zinc-100">Booking status</h3>
          <p className="mb-6 text-xs text-zinc-500">Breakdown across all bookings</p>
          <StatusDonut counts={data.statusCounts} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="admin-card p-5 sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Recent bookings</h3>
              <p className="text-xs text-zinc-500">Latest reservations</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
              <BedDouble className="h-4 w-4" />
            </span>
          </div>
          <RecentBookingsTable bookings={data.recentBookings} />
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Today&apos;s activity</h3>
              <p className="text-xs text-zinc-500">Live timeline</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <TodayActivities activities={data.todayActivities} />
        </div>
      </div>

      <p className="pt-2 text-center text-xs text-zinc-600">
        Data refreshes on page load.{" "}
        <Link href="/bookings" className="text-gold-500 hover:text-gold-400">
          Manage bookings →
        </Link>
      </p>
    </div>
  );
}
