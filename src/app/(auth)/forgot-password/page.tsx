"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import AuthShell from "@/components/dashboard/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter the email linked to your admin account and we'll send you a temporary password."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-gold-400 transition hover:text-gold-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="animate-fade-up space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Temporary password sent
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                If an account exists for{" "}
                <span className="font-medium text-zinc-100">{email}</span>, a
                temporary password has been emailed. It expires in 15 minutes.
                Sign in with it and you&apos;ll be prompted to set a new password.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="gold-bg block rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-[#0A0A0D]"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-gold-500" /> Email address
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="admin@nagasresort.com"
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
              <Send className="h-4 w-4" />
            )}
            {loading ? "Sending…" : "Send temporary password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
