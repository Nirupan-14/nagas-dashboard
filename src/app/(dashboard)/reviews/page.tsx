"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import ReviewsTable, { type ReviewRow } from "@/components/dashboard/ReviewsTable";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [reviewsRes, meRes] = await Promise.all([
          fetch("/api/admin/reviews", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const reviewsJson = await reviewsRes.json();
        const meJson = await meRes.json();
        if (!reviewsRes.ok)
          throw new Error(reviewsJson?.error || "Failed to load reviews");
        if (!cancelled) {
          setReviews(reviewsJson.reviews || []);
          setIsAdmin(meJson?.user?.role === "admin");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load reviews."
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to delete review.");
    }
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Star className="h-4 w-4 text-gold-500" />
        <p className="text-sm text-zinc-500">
          {reviews.length} review{reviews.length === 1 ? "" : "s"} from guests
          {isAdmin ? (
            <span className="ml-2 text-[0.65rem] text-zinc-600">
              — Admins can delete reviews
            </span>
          ) : null}
        </p>
      </div>

      <ReviewsTable
        reviews={reviews}
        isAdmin={isAdmin}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}