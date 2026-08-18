import type { ReactNode } from "react";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0D] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-gold-600/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #C49A3C 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="gold-bg flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_8px_30px_rgba(196,154,60,0.35)]">
              <span className="text-lg font-black tracking-tighter text-[#0A0A0D]">
                N
              </span>
            </span>
            <span className="mt-1 block">
              <span className="block text-sm font-semibold uppercase tracking-[0.3em] text-zinc-200">
                Nagas Resort
              </span>
              <span className="mt-0.5 block text-[0.65rem] uppercase tracking-[0.42em] text-gold-500">
                Admin Dashboard
              </span>
            </span>
          </Link>
        </div>

        <div className="admin-card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-zinc-100">{title}</h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>
        ) : null}

        <p className="mt-8 text-center text-[0.7rem] uppercase tracking-[0.25em] text-zinc-600">
          © {new Date().getFullYear()} Nagas Resort &amp; Spa
        </p>
      </div>
    </div>
  );
}
