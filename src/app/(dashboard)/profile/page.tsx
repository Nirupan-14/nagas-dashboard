"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AtSign,
  Check,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { RoleBadge } from "@/components/dashboard/users/RoleBadge";

interface MeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    async function load() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load profile");
        setUser(json.user);
        setName(json.user.name || "");
        setUsername(json.user.username || "");
        setLoading(false);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile.");
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError("");
    setProfileMsg("");
    setSavingProfile(true);

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), username: username.trim() }),
    });
    const data = await res.json().catch(() => ({}));

    setSavingProfile(false);
    if (!res.ok) {
      setProfileError(data?.error || "Unable to update profile.");
      return;
    }
    setUser((prev) => (prev ? { ...prev, ...data.user } : prev));
    setProfileMsg("Profile updated successfully.");
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError("");
    setPwMsg("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, password: newPassword }),
    });
    const data = await res.json().catch(() => ({}));

    setSavingPassword(false);
    if (!res.ok) {
      setPwError(data?.error || "Unable to change password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwMsg("Password changed successfully.");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (loadError || !user) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {loadError || "Profile unavailable."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in space-y-6">
      <div className="admin-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <span className="gold-bg flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-[#0A0A0D]">
          {user.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || <UserRound className="h-6 w-6" />}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-100">{user.name}</h2>
            <RoleBadge role={user.role} />
          </div>
          <div className="mt-1 flex flex-col gap-0.5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AtSign className="h-3.5 w-3.5" /> @{user.username}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#131316] px-3.5 py-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-gold-500" />
          {user.permissions.length} permissions
        </span>
      </div>

      <form onSubmit={saveProfile} className="admin-card space-y-5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <UserRound className="h-4 w-4 text-gold-500" /> Personal details
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
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-gold-500" /> Email address
            </span>
            <input value={user.email} disabled className="admin-input opacity-50" />
          </label>
          <div className="flex items-end">
            <span className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#131316] px-3.5 py-2.5 text-xs text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-gold-500" />
              Your email and role are controlled by an admin.
            </span>
          </div>
        </div>

        {profileError ? (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {profileError}
          </div>
        ) : null}
        {profileMsg ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <Check className="h-4 w-4" /> {profileMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={savingProfile}
          className="gold-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {savingProfile ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form onSubmit={savePassword} className="admin-card space-y-5 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <KeyRound className="h-4 w-4 text-gold-500" /> Change password
        </h3>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <LockKeyhole className="h-3.5 w-3.5 text-gold-500" /> Current password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="admin-input"
            placeholder="Your current password"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              New password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="admin-input pr-11"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-gold-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Confirm new password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="admin-input"
              placeholder="Re-enter new password"
            />
          </label>
        </div>

        {pwError ? (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {pwError}
          </div>
        ) : null}
        {pwMsg ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <Check className="h-4 w-4" /> {pwMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={savingPassword}
          className="gold-bg inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingPassword ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {savingPassword ? "Updating…" : "Change password"}
        </button>
      </form>
    </div>
  );
}