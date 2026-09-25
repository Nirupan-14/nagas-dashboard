"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { RoleBadge } from "@/components/dashboard/users/RoleBadge";

export interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

const PAGE_SIZE = 8;
const ROLE_FILTERS = ["all", "admin", "manager", "staff", "viewer"];

interface UsersTableProps {
  users: UserRow[];
  currentUserId: string;
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = role === "all" || u.role === role;
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, query, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            placeholder="Search by name, email, or username…"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                resetPage();
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                role === r
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[0.65rem] uppercase tracking-widest text-zinc-500">
                <th className="px-5 py-4 font-semibold">User</th>
                <th className="px-5 py-4 font-semibold">Username</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Permissions</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-16 text-center text-sm text-zinc-500"
                  >
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                visible.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-800/60 transition last:border-0 hover:bg-zinc-800/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="gold-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-[#0A0A0D]">
                          {u.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || <UserRound className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">
                            {u.name}
                            {u.id === currentUserId ? (
                              <span className="ml-2 text-[0.65rem] font-medium text-gold-500">
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-zinc-300">
                      @{u.username}
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
                        {u.permissions.length} granted
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                          u.isActive
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                            : "border-rose-500/25 bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => router.push(`/users/${u.id}/edit`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-gold-500/40 hover:text-gold-400"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
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
            of <span className="font-semibold text-zinc-300">{filtered.length}</span>{" "}
            users
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
    </div>
  );
}