"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Check,
  DoorOpen,
  ImagePlus,
  Loader2,
  Tag,
  X,
} from "lucide-react";
import { siteImageUrl } from "@/lib/vehicles/image";

export interface RoomFormData {
  id?: string;
  roomNo: string;
  type: string;
  description: string;
  price: number;
  imageUrls: string[];
}

interface RoomFormProps {
  mode: "create" | "edit";
  initial?: RoomFormData | null;
}

interface NewImage {
  key: string;
  file: File;
  preview: string;
}

export default function RoomForm({ mode, initial }: RoomFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roomNo, setRoomNo] = useState(initial?.roomNo || "");
  const [type, setType] = useState(initial?.type || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [keptImages, setKeptImages] = useState<string[]>(
    isEdit ? initial?.imageUrls || [] : []
  );
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setErrorText("Please choose image files only (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorText("Each image must be 5MB or smaller.");
        return;
      }
    }
    setNewImages((prev) => [
      ...prev,
      ...files.map((file) => ({
        key: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    setErrorText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeKept(url: string) {
    setKeptImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNew(key: string) {
    setNewImages((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((i) => i.key !== key);
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorText("");

    if (!roomNo.trim() || !type.trim() || !description.trim()) {
      setErrorText("Room number, type and description are required.");
      return;
    }
    if (keptImages.length + newImages.length === 0) {
      setErrorText("Please upload at least one room photo.");
      return;
    }

    const form = new FormData();
    form.append("roomNo", roomNo.trim());
    form.append("type", type.trim());
    form.append("description", description.trim());
    form.append("price", price.trim() === "" ? "0" : String(Number(price)));
    if (isEdit) {
      form.append("keepImageUrls", JSON.stringify(keptImages));
    }
    for (const item of newImages) {
      form.append("images", item.file);
    }

    setLoading(true);
    const endpoint = isEdit
      ? `/api/admin/rooms/${initial?.id}`
      : "/api/admin/rooms";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(endpoint, { method, body: form });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErrorText(data?.error || "Unable to save room.");
      setLoading(false);
      return;
    }

    router.push("/rooms");
    router.refresh();
  }

  const allPreviews = [...keptImages, ...newImages.map((i) => i.preview)];

  return (
    <div className="max-w-2xl animate-fade-in space-y-6">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-gold-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to rooms
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <BedDouble className="h-4 w-4 text-gold-500" /> Room photos
          </h3>

          {allPreviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {keptImages.map((url) => (
                <div
                  key={url}
                  className="group relative h-28 overflow-hidden rounded-xl border border-zinc-800"
                >
                  <img
                    src={siteImageUrl(url)}
                    alt="Room"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeKept(url)}
                    className="absolute right-1.5 top-1.5 rounded-full border border-zinc-700 bg-black/70 p-1 text-zinc-300 transition hover:text-rose-400"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {newImages.map((item) => (
                <div
                  key={item.key}
                  className="group relative h-28 overflow-hidden rounded-xl border border-gold-500/40"
                >
                  <img
                    src={item.preview}
                    alt="New room photo"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(item.key)}
                    className="absolute right-1.5 top-1.5 rounded-full border border-zinc-700 bg-black/70 p-1 text-zinc-300 transition hover:text-rose-400"
                    aria-label="Remove new photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-700 bg-[#131316] p-8 text-center transition hover:border-gold-500/40">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFilesSelected}
            />
            <span className="gold-bg flex h-12 w-12 items-center justify-center rounded-2xl">
              <ImagePlus className="h-5 w-5 text-[#0A0A0D]" />
            </span>
            <span className="text-sm font-semibold text-zinc-300">
              {allPreviews.length > 0
                ? "Add more photos"
                : "Upload room photos"}
            </span>
            <span className="text-xs text-zinc-500">
              PNG, JPG or WebP · up to 5MB each · select multiple
            </span>
          </label>
        </div>

        <div className="admin-card space-y-5 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <Tag className="h-4 w-4 text-gold-500" /> Room details
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Room number
              </span>
              <input
                required
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="admin-input"
                placeholder="e.g. 101"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Room type
              </span>
              <input
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="admin-input"
                placeholder="e.g. Deluxe Sea View"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Description
            </span>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-input min-h-[7rem] resize-y"
              placeholder="Describe the room, size, view, and amenities…"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Price per night (USD) — 0 for custom quote
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

        {errorText ? (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errorText}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/rooms"
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
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add room"}
          </button>
        </div>
      </form>
    </div>
  );
}