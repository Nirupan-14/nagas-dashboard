"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import AuthShell from "@/components/dashboard/AuthShell";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Unable to update your password.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="You logged in with a temporary password. Choose a strong permanent password to continue."
      footer={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-medium text-gold-400 transition hover:text-gold-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      }
    >
      {done ? (
        <div className="animate-fade-up space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Password updated
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                Your password has been changed successfully. You can now access
                the dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              router.push("/");
              router.refresh();
            }}
            className="gold-bg block w-full rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-[#0A0A0D]"
          >
            Go to dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border border-gold-500/25 bg-gold-500/10 p-3.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
            <p className="text-xs leading-relaxed text-gold-200">
              For security, please set a permanent password now. Your
              temporary password will stop working once you save a new one.
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <LockKeyhole className="h-3.5 w-3.5 text-gold-500" /> Temporary password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="admin-input"
              placeholder="Your temporary password"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <KeyRound className="h-3.5 w-3.5 text-gold-500" /> New password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input pr-11"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-gold-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <KeyRound className="h-3.5 w-3.5 text-gold-500" /> Confirm new password
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="admin-input"
              placeholder="Re-enter your password"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="gold-bg flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#0A0A0D] shadow-[0_8px_30px_rgba(196,154,60,0.25)] transition hover:shadow-[0_8px_40px_rgba(196,154,60,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
