"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "@/components/dashboard/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    if (data?.mustChangePassword) {
      router.push("/change-password");
      router.refresh();
      return;
    }

    router.push("/");
    router.refresh();
  }

  function fillDemo() {
    setEmail("mosesnirupan@gmail.com");
    setPassword("1234");
    setDemoMode(true);
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage reservations, payments, and resort activity."
      footer={
        <span>
          <Link
            href="/forgot-password"
            className="font-medium text-gold-400 transition hover:text-gold-300"
          >
            Forgot your password?
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <Mail className="h-3.5 w-3.5 text-gold-500" /> Email or username
          </span>
          <input
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            placeholder="you@nagasresort.com or username"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <LockKeyhole className="h-3.5 w-3.5 text-gold-500" /> Password
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input pr-11"
              placeholder="••••••••"
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
            <LogIn className="h-4 w-4" />
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={fillDemo}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/25 bg-gold-500/5 px-4 py-2.5 text-xs font-medium text-gold-400 transition hover:border-gold-500/40 hover:bg-gold-500/10 disabled:opacity-60"
      >
        <ShieldCheck className="h-4 w-4" />
        {demoMode ? "Demo credentials filled — press Sign in" : "Use demo credentials"}
      </button>
    </AuthShell>
  );
}
