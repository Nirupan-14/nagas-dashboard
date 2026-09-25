"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BedDouble,
  CalendarCheck,
  CalendarClock,
  Car,
  CreditCard,
  Globe,
  LayoutDashboard,
  Star,
  Users,
  X,
} from "lucide-react";
import { getSiteOrigin } from "@/lib/vehicles/image";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  permission?: string;
  match?: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck, permission: "bookings:read" },
  { href: "/payments", label: "Payments", icon: CreditCard, permission: "payments:read" },
  { href: "/activities", label: "Activities", icon: Activity, permission: "activities:read" },
  { href: "/reviews", label: "Reviews", icon: Star },
  {
    href: "/vehicles",
    label: "Vehicles",
    icon: Car,
    match: (pathname) =>
      pathname === "/vehicles" ||
      (pathname.startsWith("/vehicles/") && !pathname.startsWith("/vehicles/bookings")),
  },
  { href: "/vehicles/bookings", label: "Vehicle bookings", icon: CalendarClock, permission: "bookings:read" },
  { href: "/rooms", label: "Rooms", icon: BedDouble },
  { href: "/users", label: "Users & roles", icon: Users, permission: "users:read" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  permissions?: string[];
}

export default function Sidebar({ open, onClose, permissions }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || !permissions || permissions.includes(item.permission)
  );

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-[#0E0E11] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <span className="gold-bg flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-[#0A0A0D]">
              N
            </span>
            <span className="leading-tight">
              <span className="block text-[0.8rem] font-bold uppercase tracking-[0.2em] text-zinc-100">
                Nagas
              </span>
              <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-gold-500">
                Admin
              </span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="text-zinc-500 transition hover:text-gold-400 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const active = item.match
              ? item.match(pathname)
              : item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gold-500/10 text-gold-400 shadow-[inset_0_0_0_1px_rgba(196,154,60,0.25)]"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                }`}
              >
                <item.icon
                  className={`h-[1.05rem] w-[1.05rem] ${
                    active ? "text-gold-400" : "text-zinc-500"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <Link
            href={getSiteOrigin() || "/"}
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            <Globe className="h-[1.05rem] w-[1.05rem] text-zinc-500" />
            View website
          </Link>
        </div>
      </aside>
    </>
  );
}