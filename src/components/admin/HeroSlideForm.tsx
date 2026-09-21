"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";

export interface HeroSlideFormValues {
  id?: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  headline?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  focus?: string;
  order?: number;
}

export default function HeroSlideForm({ initial }: { initial?: HeroSlideFormValues }) {
  const router = useRouter();
  const isEditing = Boolean(initial?.id);

  const [type, setType] = useState<"image" | "video">(initial?.type ?? "image");
  const [src, setSrc] = useState(initial?.src ?? "");
  const [poster, setPoster] = useState(initial?.poster ?? "");
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [subheading, setSubheading] = useState(initial?.subheading ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(initial?.ctaHref ?? "");
  const [focus, setFocus] = useState(initial?.focus ?? "");
  const [order, setOrder] = useState(initial?.order !== undefined ? String(initial.order) : "0");

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { startUpload: startMainUpload } = useUploadThing("heroMedia", {
    onClientUploadComplete: (res) => {
      setUploadingMain(false);
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      if (url) setSrc(url);
    },
    onUploadError: () => {
      setUploadingMain(false);
      setError("Upload failed — check the file and try again.");
    },
  });

  const { startUpload: startPosterUpload } = useUploadThing("heroMedia", {
    onClientUploadComplete: (res) => {
      setUploadingPoster(false);
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      if (url) setPoster(url);
    },
    onUploadError: () => {
      setUploadingPoster(false);
      setError("Poster upload failed — check the file and try again.");
    },
  });

  async function handleMainFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingMain(true);
    await startMainUpload([file]);
    e.target.value = "";
  }

  async function handlePosterFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingPoster(true);
    await startPosterUpload([file]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!src) {
      setError("Upload a photo or video first.");
      return;
    }
    if (!alt.trim()) {
      setError("Alt text is required (describes the slide for accessibility).");
      return;
    }

    setSaving(true);
    const payload = {
      type,
      src,
      poster: poster || undefined,
      alt,
      headline: headline || undefined,
      subheading: subheading || undefined,
      ctaLabel: ctaLabel || undefined,
      ctaHref: ctaHref || undefined,
      focus: focus || undefined,
      order: order.trim() === "" ? 0 : Number(order),
    };

    const res = await fetch(
      isEditing ? `/api/admin/hero-slides/${initial!.id}` : "/api/admin/hero-slides",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't save — try again.");
      return;
    }
    router.push("/admin/hero");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="text-sm text-ink-soft">Slide type</label>
        <div className="mt-1 flex gap-2">
          {(["image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
                type === t ? "border-ink bg-ink text-cream-raised" : "border-line text-ink hover:border-sage"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-ink-soft">{type === "video" ? "Video file" : "Photo"}</label>
        <div className="mt-2 flex items-center gap-4">
          {src ? (
            type === "video" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={src} className="h-24 w-24 rounded-lg object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="Slide preview" className="h-24 w-24 rounded-lg object-cover" />
            )
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-faint">
              No file
            </div>
          )}
          <div>
            <input
              type="file"
              accept={type === "video" ? "video/*" : "image/*"}
              onChange={handleMainFile}
              disabled={uploadingMain}
              className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-cream-raised"
            />
            {uploadingMain && <p className="mt-1 text-xs text-ink-soft">Uploading…</p>}
          </div>
        </div>
      </div>

      {type === "video" && (
        <div>
          <label className="text-sm text-ink-soft">Poster image (shown while the video loads)</label>
          <div className="mt-2 flex items-center gap-4">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="Poster preview" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-faint">
                None
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterFile}
              disabled={uploadingPoster}
              className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-cream-raised"
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-sm text-ink-soft">Alt text (required)</label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="e.g. Cotonel — men's pajamas"
          className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </div>

      <div>
        <label className="text-sm text-ink-soft">Headline (optional)</label>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Where comfort meets elegance."
          className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </div>

      <div>
        <label className="text-sm text-ink-soft">Subheading (optional)</label>
        <input
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          placeholder="Pure cotton sleepwear, cut for a night that actually rests you."
          className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink-soft">Button text (optional)</label>
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder="Shop sleepwear"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
        </div>
        <div>
          <label className="text-sm text-ink-soft">Button link (optional)</label>
          <input
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            placeholder="/sleepwear"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink-soft">Focus point (optional)</label>
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="center, top, 50% 20%…"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <p className="mt-1 text-xs text-ink-faint">Which part of the photo stays visible when cropped.</p>
        </div>
        <div>
          <label className="text-sm text-ink-soft">Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <p className="mt-1 text-xs text-ink-faint">Lower numbers show first.</p>
        </div>
      </div>

      {error && <p className="text-sm text-blush-deep">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploadingMain || uploadingPoster}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream-raised transition hover:bg-sage-deep disabled:opacity-60"
      >
        {saving ? "Saving…" : isEditing ? "Save changes" : "Add slide"}
      </button>
    </form>
  );
}
