"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Loader2,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import Sidebar, { NAV_ITEMS } from "@/components/dashboard/Sidebar";

interface TopbarProps {
  user: { name: string; email: string; role: string };
  onMenuClick: () => void;
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — proceed to login regardless
    }
    router.push("/login");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-[#0A0A0D]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-zinc-400 transition hover:text-gold-400 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="hidden text-sm text-zinc-500 sm:block">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="relative rounded-xl border border-zinc-800 bg-[#131316] p-2.5 text-zinc-400 transition hover:border-gold-500/30 hover:text-gold-400"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#131316] py-1.5 pl-1.5 pr-2.5 transition hover:border-gold-500/30"
          >
            <span className="gold-bg flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-[#0A0A0D]">
              {initials || <UserRound className="h-4 w-4" />}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[10rem] truncate text-sm font-semibold text-zinc-100">
                {user.name}
              </span>
              <span className="block text-[0.65rem] capitalize text-zinc-500">
                {user.role}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-zinc-500 sm:block" />
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 z-20 mt-2 w-56 animate-fade-up rounded-2xl border border-zinc-800 bg-[#131316] p-1.5 shadow-2xl shadow-black/60">
                <div className="border-b border-zinc-800 px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Sign out
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function pageTitleFromPath(pathname: string): string {
  const path = pathname.split("?")[0];
  if (path === "/") return "Overview";
  for (const item of NAV_ITEMS) {
    if (item.href !== "/" && path.startsWith(item.href)) return item.label;
  }
  return "Dashboard";
}

interface ShellProps {
  user: { name: string; email: string; role: string };
  children: ReactNode;
}

export default function Shell({ user, children }: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const title = pageTitleFromPath(pathname);

  return (
    <div className="min-h-screen bg-[#0A0A0D]">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <Topbar user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {title}
            </h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
