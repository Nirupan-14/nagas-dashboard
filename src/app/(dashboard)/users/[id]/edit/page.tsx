"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserForm, {
  type UserFormData,
} from "@/components/dashboard/users/UserForm";
import { ROLE_PERMISSIONS, type UserRole } from "@/lib/roles";

function hydrate(raw: any): UserFormData | null {
  if (!raw) return null;
  return {
    id: raw.id,
    name: raw.name,
    username: raw.username,
    email: raw.email,
    role: raw.role as UserRole,
    permissions: raw.permissions?.length
      ? raw.permissions
      : ROLE_PERMISSIONS[raw.role as UserRole] || [],
    isActive: raw.isActive !== false,
  };
}

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserFormData | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [userRes, meRes] = await Promise.all([
          fetch(`/api/admin/users/${params.id}`, { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const userJson = await userRes.json();
        const meJson = await meRes.json();
        if (!userRes.ok) throw new Error(userJson?.error || "Failed to load user");
        if (!cancelled) {
          setUser(hydrate(userJson.user));
          setCurrentUserId(meJson?.user?.id || "");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error || "User not found."}
      </div>
    );
  }

  return (
    <UserForm
      mode="edit"
      initial={user}
      currentUserId={currentUserId}
    />
  );
}