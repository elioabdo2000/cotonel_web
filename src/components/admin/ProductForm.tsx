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
  sizes?: string[]; // older products only have names — quantities get filled in on next save
  sizeStock?: { size: string; quantity: number }[];
  colors?: string[];
  stock?: number;
}

const QUICK_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface SizeRow {
  size: string;
  quantity: string; // kept as text so the input can be empty while typing
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
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(() => {
    if (initial?.sizeStock?.length) {
      return initial.sizeStock.map((r) => ({ size: r.size, quantity: String(r.quantity) }));
    }
    // Older product: it has size names but no quantities yet — the admin fills them in.
    return (initial?.sizes ?? []).map((size) => ({ size, quantity: "" }));
  });
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

  const hasSizes = sizeRows.length > 0;
  const totalQuantity = sizeRows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

  function addSizeRow(size = "") {
    setSizeRows((rows) => [...rows, { size, quantity: "" }]);
  }
  function updateSizeRow(index: number, patch: Partial<SizeRow>) {
    setSizeRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeSizeRow(index: number) {
    setSizeRows((rows) => rows.filter((_, i) => i !== index));
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

    // Validate the size rows: every size needs a name and a whole-number quantity.
    const names = new Set<string>();
    for (const row of sizeRows) {
      const name = row.size.trim().toLowerCase();
      const qty = Number(row.quantity);
      if (!name) {
        setError("Every size needs a name — fill it in or remove the empty row.");
        return;
      }
      if (row.quantity.trim() === "" || !Number.isInteger(qty) || qty < 0) {
        setError(`Enter a quantity for size ${row.size.trim()} (use 0 if it's sold out).`);
        return;
      }
      if (names.has(name)) {
        setError(`Size ${row.size.trim()} is listed twice.`);
        return;
      }
      names.add(name);
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
      // Empty list = no sizes, so the size picker is hidden on the site.
      sizeStock: sizeRows.map((r) => ({ size: r.size.trim(), quantity: Number(r.quantity) })),
      colors: colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      // With sizes, the server adds the quantities up to get the total stock.
      stock: hasSizes ? undefined : stock.trim() === "" ? undefined : Number(stock),
    };

    if (!hasSizes && payload.stock === undefined) {
      setError("Stock is required — enter 0 if the item is sold out.");
      setSaving(false);
      return;
    }
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

      <div className="rounded-lg border border-line bg-cream-raised p-4">
        <label className="text-sm text-ink-soft">Sizes &amp; quantities (optional)</label>
        <p className="mt-1 text-xs text-ink-faint">
          Add each size with how many you have. When a size reaches 0 it shows as Sold Out on the
          site and can&apos;t be picked. Leave empty if this product has no sizes.
        </p>

        {hasSizes && (
          <div className="mt-3 flex flex-col gap-2">
            {sizeRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.size}
                  onChange={(e) => updateSizeRow(i, { size: e.target.value })}
                  placeholder="Size (e.g. M)"
                  aria-label="Size name"
                  className="w-32 rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
                />
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={row.quantity}
                  onChange={(e) => updateSizeRow(i, { quantity: e.target.value })}
                  placeholder="Qty"
                  aria-label={`Quantity for size ${row.size || i + 1}`}
                  className="w-24 rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
                />
                {row.quantity.trim() !== "" && Number(row.quantity) === 0 && (
                  <span className="text-xs text-blush-deep">Sold out</span>
                )}
                <button
                  type="button"
                  onClick={() => removeSizeRow(i)}
                  className="ml-auto text-xs text-blush-deep hover:brightness-90"
                >
                  Remove
                </button>
              </div>
            ))}
            <p className="mt-1 text-xs text-ink-soft">Total in stock: {totalQuantity}</p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {QUICK_SIZES.filter(
            (q) => !sizeRows.some((r) => r.size.trim().toLowerCase() === q.toLowerCase())
          ).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => addSizeRow(q)}
              className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-sage"
            >
              + {q}
            </button>
          ))}
          <button
            type="button"
            onClick={() => addSizeRow()}
            className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-ink-soft hover:border-sage"
          >
            + Custom size
          </button>
        </div>
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

      {hasSizes ? (
        <p className="text-sm text-ink-soft">
          Total stock: <span className="font-medium text-ink">{totalQuantity}</span> — calculated
          from the sizes above. The product shows as Sold Out when every size is at 0.
        </p>
      ) : (
        <div>
          <label className="text-sm text-ink-soft">Stock (required)</label>
          <input
            type="number"
            min={0}
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="e.g. 4"
            className="mt-1 w-full max-w-[10rem] rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <p className="mt-1 text-xs text-ink-faint">
            Enter 0 to mark it Sold Out. At 1 or 2 left, the site shows a &quot;last piece&quot;
            notice. This is what will later sync from Cotonel store management.
          </p>
        </div>
      )}

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
