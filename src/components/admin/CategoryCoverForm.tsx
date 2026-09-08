"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";

export default function CategoryCoverForm({
  slug,
  label,
  currentImage,
  fallbackImage,
}: {
  slug: string;
  label: string;
  currentImage?: string;
  fallbackImage?: string;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { startUpload } = useUploadThing("categoryCover", {
    onClientUploadComplete: async (res) => {
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      setUploading(false);
      if (!url) return;

      setSaving(true);
      const r = await fetch(`/api/admin/category-covers/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      setSaving(false);
      if (!r.ok) {
        setError("Couldn't save the cover — try again.");
        return;
      }
      router.refresh();
    },
    onUploadError: () => {
      setUploading(false);
      setError("Upload failed — check your UploadThing setup and try again.");
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    await startUpload([file]);
  }

  async function handleRemove() {
    setSaving(true);
    setError("");
    const r = await fetch(`/api/admin/category-covers/${slug}`, { method: "DELETE" });
    setSaving(false);
    if (!r.ok) {
      setError("Couldn't remove the cover — try again.");
      return;
    }
    router.refresh();
  }

  const displayImage = currentImage ?? fallbackImage;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-cream-raised p-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-sage-soft">
        {displayImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayImage} alt={label} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          {currentImage
            ? "Custom cover set."
            : fallbackImage
              ? "Using a featured product photo (no custom cover set)."
              : "No photo yet — this category's circle won't show on the homepage."}
        </p>
        {error && <p className="mt-1 text-xs text-blush-deep">{error}</p>}
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream-raised transition hover:bg-sage-deep">
          {uploading || saving ? "Saving…" : currentImage ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || saving}
            className="hidden"
          />
        </label>
        {currentImage && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading || saving}
            className="text-xs text-ink-soft transition hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
