"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Check,
  ImagePlus,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { siteImageUrl } from "@/lib/vehicles/image";

export interface VehicleFormData {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface VehicleFormProps {
  mode: "create" | "edit";
  initial?: VehicleFormData | null;
}

export default function VehicleForm({ mode, initial }: VehicleFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [preview, setPreview] = useState<string | null>(
    initial?.imageUrl ? siteImageUrl(initial.imageUrl) : null
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, WebP).");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }
    setFile(selected);
    setError("");
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }
    if (!isEdit && !file) {
      setError("Please upload a vehicle photo.");
      return;
    }

    const form = new FormData();
    form.append("name", name.trim());
    form.append("description", description.trim());
    form.append("price", price.trim() === "" ? "0" : String(Number(price)));
    if (file) form.append("image", file);

    setLoading(true);
    const endpoint = isEdit ? `/api/admin/vehicles/${initial?.id}` : "/api/admin/vehicles";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, { method, body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data?.error || "Unable to save vehicle.");
      setLoading(false);
      return;
    }

    router.push("/vehicles");
    router.refresh();
  }

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-gold-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vehicles
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <Car className="h-4 w-4 text-gold-500" /> Vehicle photo
          </h3>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 bg-[#131316] p-8 text-center transition hover:border-gold-500/40">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelected}
            />
            {preview ? (
              <div className="relative w-full">
                <div className="relative h-52 w-full overflow-hidden rounded-xl border border-zinc-800">
                  <img
                    src={preview}
                    alt="Vehicle preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPreview(null);
                    setFile(null);
                  }}
                  className="absolute right-2 top-2 rounded-full border border-zinc-700 bg-black/70 p-1.5 text-zinc-300 transition hover:text-rose-400"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="mt-3 text-xs text-zinc-500">
                  Click to choose a different photo
                </p>
              </div>
            ) : (
              <>
                <span className="gold-bg flex h-14 w-14 items-center justify-center rounded-2xl">
                  <ImagePlus className="h-6 w-6 text-[#0A0A0D]" />
                </span>
                <span className="text-sm font-semibold text-zinc-300">
                  Upload a vehicle photo
                </span>
                <span className="text-xs text-zinc-500">
                  PNG, JPG or WebP · up to 5MB
                </span>
              </>
            )}
          </label>
        </div>

        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <Tag className="h-4 w-4 text-gold-500" /> Vehicle details
          </h3>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Vehicle type / name
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input"
              placeholder="e.g. Luxury Sedan"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Description
            </span>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-input min-h-[7rem] resize-y"
              placeholder="Describe the vehicle, capacity, and best use cases…"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Price per journey (USD) — 0 for custom quote
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="admin-input"
              placeholder="0 = Custom quote"
            />
          </label>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/vehicles"
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
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}