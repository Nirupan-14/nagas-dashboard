"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ROLE_PERMISSIONS, type UserRole } from "@/lib/roles";

export interface UserFormData {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
}

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Full access to everything" },
  { value: "manager", label: "Manager", description: "Manage bookings, payments & activities" },
  { value: "staff", label: "Staff", description: "View & update bookings and activities" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
];

const PERMISSION_GROUPS: { group: string; label: string; permissions: string[] }[] = [
  {
    group: "users",
    label: "Users",
    permissions: ["users:create", "users:read", "users:update", "users:delete"],
  },
  {
    group: "bookings",
    label: "Bookings",
    permissions: ["bookings:create", "bookings:read", "bookings:update", "bookings:delete"],
  },
  {
    group: "payments",
    label: "Payments",
    permissions: ["payments:create", "payments:read", "payments:update", "payments:delete"],
  },
  {
    group: "activities",
    label: "Activities",
    permissions: ["activities:create", "activities:read", "activities:update", "activities:delete"],
  },
  {
    group: "settings",
    label: "Settings",
    permissions: ["settings:read", "settings:update"],
  },
];

interface UserFormProps {
  mode: "create" | "edit";
  initial?: UserFormData | null;
  currentUserId?: string;
}

export default function UserForm({ mode, initial, currentUserId }: UserFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(initial?.name || "");
  const [username, setUsername] = useState(initial?.username || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [role, setRole] = useState<UserRole>(initial?.role || "staff");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>(
    initial?.permissions?.length ? initial.permissions : ROLE_PERMISSIONS.staff
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSelf = isEdit && initial?.id === currentUserId;

  function selectRole(next: UserRole) {
    setRole(next);
    setPermissions(ROLE_PERMISSIONS[next]);
  }

  function togglePermission(p: string) {
    setPermissions((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !username.trim() || !email.trim()) {
      setError("Name, username, and email are required.");
      return;
    }

    if (!isEdit && password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (isEdit && password && password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);

    const body: Record<string, unknown> = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      role,
      permissions,
    };

    if (isEdit) {
      body.isActive = isActive;
      if (password) body.password = password;
    } else {
      body.password = password;
    }

    const endpoint = isEdit ? `/api/admin/users/${initial?.id}` : "/api/admin/users";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Unable to save user.");
      setLoading(false);
      return;
    }

    router.push("/users");
    router.refresh();
  }

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-gold-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <UserRound className="h-4 w-4 text-gold-500" /> Account details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Full name
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="admin-input"
                placeholder="e.g. Sarah Perera"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Username
              </span>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="admin-input"
                placeholder="sarah.perera"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-gold-500" /> Email address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="sarah@nagasresort.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <KeyRound className="h-3.5 w-3.5 text-gold-500" />
              {isEdit ? "New password (leave blank to keep current)" : "Temporary password"}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              placeholder={isEdit ? "Enter new password…" : "At least 4 characters"}
              autoComplete="new-password"
            />
            {!isEdit ? (
              <span className="mt-1.5 block text-[0.7rem] text-zinc-500">
                The user will be asked to set their own password on first sign-in.
              </span>
            ) : null}
          </label>
        </div>

        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-gold-500" /> Role & permissions
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => {
              const selected = role === r.value;
              const disabledRole = isSelf && r.value !== "admin" && role === "admin";
              return (
                <button
                  key={r.value}
                  type="button"
                  disabled={disabledRole}
                  onClick={() => selectRole(r.value)}
                  className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    selected
                      ? "border-gold-500/50 bg-gold-500/10"
                      : "border-zinc-800 bg-[#131316] hover:border-zinc-700"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-100 capitalize">
                      {r.label}
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 text-gold-400" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {r.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.group} className="rounded-xl border border-zinc-800 bg-[#131316] p-4">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.permissions.map((p) => {
                    const checked = permissions.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePermission(p)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition ${
                          checked
                            ? "border-gold-500/40 bg-gold-500/10 text-gold-400"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            checked ? "bg-gold-400" : "bg-zinc-700"
                          }`}
                        />
                        {p.split(":")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {isEdit ? (
            <label className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#131316] px-4 py-3.5">
              <span>
                <span className="block text-sm font-semibold text-zinc-100">
                  Active account
                </span>
                <span className="block text-xs text-zinc-500">
                  Inactive users cannot sign in.
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                disabled={isSelf}
                className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
                  isActive ? "bg-gold-500" : "bg-zinc-700"
                }`}
                aria-label="Toggle active"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    isActive ? "left-[1.4rem]" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/users"
            className="rounded-xl border border-zinc-800 px-5 py-2.5 text-center text-sm font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="gold-bg inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {loading ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}