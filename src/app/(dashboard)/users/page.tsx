"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, UserRound } from "lucide-react";
import UsersTable, { type UserRow } from "@/components/dashboard/users/UsersTable";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load users");
        if (!cancelled) {
          setUsers(json.users || []);
          setCurrentUserId(json.currentUserId || "");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
          <UserRound className="h-4 w-4 text-gold-500" />
          {users.length} team member{users.length === 1 ? "" : "s"} with role-based
          access
        </p>
        <Link
          href="/users/new"
          className="gold-bg inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition hover:shadow-[0_8px_30px_rgba(196,154,60,0.35)]"
        >
          <Plus className="h-4 w-4" /> Add user
        </Link>
      </div>

      <UsersTable users={users} currentUserId={currentUserId} />
    </div>
  );
}