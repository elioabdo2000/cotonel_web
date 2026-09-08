"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/data/categories";
import { useUploadThing } from "@/lib/uploadthing";

export interface ProductFormValues {
  id?: string;
  name: string;
  price: string;
  description?: string;
  category: string;
  image: string;
  images?: string[];
  gender?: "men" | "women" | "unisex";
  featured: boolean;
  bestseller?: boolean;
  onSale?: boolean;
  salePrice?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
}

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const isEditing = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0].slug);
  const [image, setImage] = useState(initial?.image ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [gender, setGender] = useState<"men" | "women" | "unisex" | "">(initial?.gender ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [bestseller, setBestseller] = useState(initial?.bestseller ?? false);
  const [onSale, setOnSale] = useState(initial?.onSale ?? false);
  const [salePrice, setSalePrice] = useState(initial?.salePrice ?? "");
  const [sizes, setSizes] = useState((initial?.sizes ?? []).join(", "));
  const [colors, setColors] = useState((initial?.colors ?? []).join(", "));
  const [stock, setStock] = useState(initial?.stock !== undefined ? String(initial.stock) : "");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { startUpload } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      setUploading(false);
      const urls = (res ?? []).map((r) => r.ufsUrl ?? r.url).filter((u): u is string => Boolean(u));
      if (urls.length === 0) return;

      setImage((prevImage) => {
        if (prevImage) {
          setImages((prevImages) => [...prevImages, ...urls]);
          return prevImage;
        }
        const [cover, ...rest] = urls;
        if (rest.length) setImages((prevImages) => [...prevImages, ...rest]);
        return cover;
      });
    },
    onUploadError: () => {
      setUploading(false);
      setError("Photo upload failed — check your UploadThing setup and try again.");
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    await startUpload(files);
    e.target.value = "";
  }

  function setCover(url: string) {
    setImages((prev) => {
      const withoutNew = prev.filter((u) => u !== url);
      return image ? [...withoutNew, image] : withoutNew;
    });
    setImage(url);
  }

  function removeGalleryImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!image) {
      setError("Add a photo before saving.");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      price,
      description,
      category,
      image,
      images,
      gender: gender || undefined,
      featured,
      bestseller,
      onSale,
      salePrice,
      sizes: sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      stock: stock.trim() === "" ? undefined : Number(stock),
    };
    const res = await fetch(isEditing ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong — try again.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <div>
        <label className="text-sm text-ink-soft">Photos</label>
        <div className="mt-2 flex items-center gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Product cover" className="h-24 w-24 rounded-lg object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-line text-xs text-ink-faint">
              No photo
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:text-cream-raised"
            />
            {uploading && <p className="mt-1 text-xs text-ink-soft">Uploading…</p>}
            <p className="mt-1 text-xs text-ink-faint">
              Select several at once. The first becomes the cover photo shown everywhere on the
              site — the rest appear as extra photos in the product details popup.
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Product gallery" className="h-16 w-16 rounded-lg object-cover" />
                <div className="mt-1 flex gap-2 text-[11px]">
                  <button type="button" onClick={() => setCover(url)} className="text-ink-soft hover:text-ink">
                    Set as cover
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="text-blush-deep hover:brightness-90"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm text-ink-soft">Product name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink-soft">Price (optional)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="$18"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
        </div>
        <div>
          <label className="text-sm text-ink-soft">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-ink-soft">Gender (optional)</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as typeof gender)}
          className="mt-1 w-full max-w-[12rem] rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        >
          <option value="">Not set</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="unisex">Unisex</option>
        </select>
        <p className="mt-1 text-xs text-ink-faint">
          Once a category has both Men and Women products, its page automatically shows tabs to
          filter between them.
        </p>
      </div>

      <div className="rounded-lg border border-line bg-cream-raised p-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[var(--color-sage)]"
          />
          This product is on sale
        </label>
        {onSale && (
          <div className="mt-3">
            <label className="text-sm text-ink-soft">Sale price</label>
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder="$14"
              className="mt-1 w-full max-w-[10rem] rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
            />
            <p className="mt-1 text-xs text-ink-faint">
              The regular price above shows struck-through next to this one.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm text-ink-soft">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A short note shown in the product details popup — fabric, fit, care..."
          className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink-soft">Sizes (optional)</label>
          <input
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="S, M, L, XL"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <p className="mt-1 text-xs text-ink-faint">Comma-separated. Leave blank to hide the size picker.</p>
        </div>
        <div>
          <label className="text-sm text-ink-soft">Colors (optional)</label>
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Ivory, Sage, Black"
            className="mt-1 w-full rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <p className="mt-1 text-xs text-ink-faint">Comma-separated. Leave blank to hide the color picker.</p>
        </div>
      </div>

      <div>
        <label className="text-sm text-ink-soft">Stock (optional)</label>
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="e.g. 4"
          className="mt-1 w-full max-w-[10rem] rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
        <p className="mt-1 text-xs text-ink-faint">
          Leave blank to hide stock info. This is what will later sync from Cotonel store management.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[var(--color-sage)]"
          />
          Use as this category&apos;s large homepage photo
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={(e) => setBestseller(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[var(--color-sage)]"
          />
          Show in the Bestsellers section on the homepage
        </label>
      </div>

      {error && <p className="text-sm text-blush-deep">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream-raised transition hover:bg-sage-deep disabled:opacity-60"
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Add product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
