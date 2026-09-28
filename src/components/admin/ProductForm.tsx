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
  colorStock?: { color: string; quantity?: number; sizes?: { size: string; quantity: number }[] }[];
  stock?: number;
}

const QUICK_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface SizeRow {
  size: string;
  quantity: string; // kept as text so the input can be empty while typing
}

interface ColorRow {
  color: string;
  quantity: string; // only used when the color has no sizes
  sizes: SizeRow[];
}

const inputCls =
  "rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage";

// The rows of "size + quantity" with quick-add buttons. Used once for a product without
// colors, and once inside every color card.
function SizeRowsEditor({ rows, onChange }: { rows: SizeRow[]; onChange: (rows: SizeRow[]) => void }) {
  const update = (i: number, patch: Partial<SizeRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div>
      {rows.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.size}
                onChange={(e) => update(i, { size: e.target.value })}
                placeholder="Size (e.g. M)"
                aria-label="Size name"
                className={`w-32 ${inputCls}`}
              />
              <input
                type="number"
                min={0}
                step={1}
                value={row.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })}
                placeholder="Qty"
                aria-label={`Quantity for size ${row.size || i + 1}`}
                className={`w-24 ${inputCls}`}
              />
              {row.quantity.trim() !== "" && Number(row.quantity) === 0 && (
                <span className="text-xs text-blush-deep">Sold out</span>
              )}
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                className="ml-auto text-xs text-blush-deep hover:brightness-90"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {QUICK_SIZES.filter((q) => !rows.some((r) => r.size.trim().toLowerCase() === q.toLowerCase())).map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onChange([...rows, { size: q, quantity: "" }])}
            className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-sage"
          >
            + {q}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange([...rows, { size: "", quantity: "" }])}
          className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-ink-soft hover:border-sage"
        >
          + Custom size
        </button>
      </div>
    </div>
  );
}

// Returns an error message if any row is incomplete, else null.
function sizeRowsError(rows: SizeRow[], where: string): string | null {
  const names = new Set<string>();
  for (const row of rows) {
    const name = row.size.trim().toLowerCase();
    const qty = Number(row.quantity);
    if (!name) return `${where}Every size needs a name — fill it in or remove the empty row.`;
    if (row.quantity.trim() === "" || !Number.isInteger(qty) || qty < 0) {
      return `${where}Enter a quantity for size ${row.size.trim()} (use 0 if it's sold out).`;
    }
    if (names.has(name)) return `${where}Size ${row.size.trim()} is listed twice.`;
    names.add(name);
  }
  return null;
}

const rowsTotal = (rows: SizeRow[]) => rows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);

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
  // Product-level sizes — only used when the product has no colors.
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(() => {
    if (initial?.colorStock?.length || initial?.colors?.length) return []; // they live under the colors
    if (initial?.sizeStock?.length) {
      return initial.sizeStock.map((r) => ({ size: r.size, quantity: String(r.quantity) }));
    }
    // Older product: it has size names but no quantities yet — the admin fills them in.
    return (initial?.sizes ?? []).map((size) => ({ size, quantity: "" }));
  });
  // Colors, each with its own sizes and quantities.
  const [colorRows, setColorRows] = useState<ColorRow[]>(() => {
    if (initial?.colorStock?.length) {
      return initial.colorStock.map((c) => ({
        color: c.color,
        quantity: c.quantity !== undefined ? String(c.quantity) : "",
        sizes: (c.sizes ?? []).map((r) => ({ size: r.size, quantity: String(r.quantity) })),
      }));
    }
    // Older product with plain color names: give every color the product's sizes. With a
    // single color the old quantities carry over; with several the admin fills them in.
    const legacyColors = initial?.colors ?? [];
    const legacySizes = initial?.sizeStock?.length
      ? initial.sizeStock
      : (initial?.sizes ?? []).map((size) => ({ size, quantity: undefined as number | undefined }));
    return legacyColors.map((color) => ({
      color,
      quantity: "",
      sizes: legacySizes.map((r) => ({
        size: r.size,
        quantity: legacyColors.length === 1 && r.quantity !== undefined ? String(r.quantity) : "",
      })),
    }));
  });
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

  const hasColors = colorRows.length > 0;
  const hasSizes = sizeRows.length > 0;
  const colorTotal = (c: ColorRow) => (c.sizes.length ? rowsTotal(c.sizes) : Number(c.quantity) || 0);
  const totalQuantity = hasColors ? colorRows.reduce((sum, c) => sum + colorTotal(c), 0) : rowsTotal(sizeRows);

  function addColor() {
    if (colorRows.length === 0) {
      // First color: it takes over the sizes already entered for the product.
      setColorRows([{ color: "", quantity: "", sizes: sizeRows }]);
      setSizeRows([]);
      return;
    }
    // Next colors start with the same size names as the previous one (quantities blank).
    const last = colorRows[colorRows.length - 1];
    setColorRows([
      ...colorRows,
      { color: "", quantity: "", sizes: last.sizes.map((r) => ({ size: r.size, quantity: "" })) },
    ]);
  }
  function updateColor(index: number, patch: Partial<ColorRow>) {
    setColorRows((rows) => rows.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function removeColor(index: number) {
    setColorRows((rows) => rows.filter((_, i) => i !== index));
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

    // Validate: every color needs a name, and every size a name and a whole-number quantity.
    if (hasColors) {
      const colorNames = new Set<string>();
      for (const c of colorRows) {
        const label = c.color.trim() || "a color";
        if (!c.color.trim()) {
          setError("Every color needs a name — fill it in or remove the empty one.");
          return;
        }
        if (colorNames.has(c.color.trim().toLowerCase())) {
          setError(`Color ${c.color.trim()} is listed twice.`);
          return;
        }
        colorNames.add(c.color.trim().toLowerCase());
        const problem = c.sizes.length
          ? sizeRowsError(c.sizes, `${label}: `)
          : c.quantity.trim() === "" || !Number.isInteger(Number(c.quantity)) || Number(c.quantity) < 0
            ? `${label}: enter a quantity (use 0 if it's sold out), or add sizes.`
            : null;
        if (problem) {
          setError(problem);
          return;
        }
      }
    } else {
      const problem = sizeRowsError(sizeRows, "");
      if (problem) {
        setError(problem);
        return;
      }
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
      // Empty list = no colors (no color picker on the site). With colors, the server works out
      // each color's sizes, the size list and the total stock from these.
      colorStock: colorRows.map((c) =>
        c.sizes.length
          ? {
              color: c.color.trim(),
              sizes: c.sizes.map((r) => ({ size: r.size.trim(), quantity: Number(r.quantity) })),
            }
          : { color: c.color.trim(), quantity: Number(c.quantity) }
      ),
      // Product-level sizes only apply when there are no colors. Empty list = no size picker.
      sizeStock: hasColors ? undefined : sizeRows.map((r) => ({ size: r.size.trim(), quantity: Number(r.quantity) })),
      // With sizes or colors, the server adds the quantities up to get the total stock.
      stock: hasColors || hasSizes ? undefined : stock.trim() === "" ? undefined : Number(stock),
    };

    if (!hasColors && !hasSizes && payload.stock === undefined) {
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

      {hasColors ? (
        <div className="rounded-lg border border-line bg-cream-raised p-4">
          <label className="text-sm text-ink-soft">Colors, sizes &amp; quantities</label>
          <p className="mt-1 text-xs text-ink-faint">
            Each color has its own sizes and quantities. A size at 0 shows as Sold Out for that
            color; a color is Sold Out once all its sizes are at 0.
          </p>

          <div className="mt-3 flex flex-col gap-4">
            {colorRows.map((c, i) => (
              <div key={i} className="rounded-lg border border-line p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={c.color}
                    onChange={(e) => updateColor(i, { color: e.target.value })}
                    placeholder="Color (e.g. Pink)"
                    aria-label="Color name"
                    className={`w-48 ${inputCls}`}
                  />
                  <span className="text-xs text-ink-soft">{colorTotal(c)} in stock</span>
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="ml-auto text-xs text-blush-deep hover:brightness-90"
                  >
                    Remove color
                  </button>
                </div>

                <SizeRowsEditor rows={c.sizes} onChange={(sizes) => updateColor(i, { sizes })} />

                {c.sizes.length === 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={c.quantity}
                      onChange={(e) => updateColor(i, { quantity: e.target.value })}
                      placeholder="Qty"
                      aria-label={`Quantity for ${c.color || "this color"}`}
                      className={`w-24 ${inputCls}`}
                    />
                    <span className="text-xs text-ink-faint">
                      No sizes for this color? Enter its quantity here.
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addColor}
            className="mt-3 rounded-full border border-dashed border-line px-3 py-1 text-xs text-ink-soft hover:border-sage"
          >
            + Add another color
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-line bg-cream-raised p-4">
            <label className="text-sm text-ink-soft">Sizes &amp; quantities (optional)</label>
            <p className="mt-1 text-xs text-ink-faint">
              Add each size with how many you have. When a size reaches 0 it shows as Sold Out on
              the site and can&apos;t be picked. Leave empty if this product has no sizes.
            </p>
            <SizeRowsEditor rows={sizeRows} onChange={setSizeRows} />
          </div>

          <div>
            <button
              type="button"
              onClick={addColor}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-ink hover:border-sage"
            >
              + Add colors
            </button>
            <p className="mt-1 text-xs text-ink-faint">
              Does it come in several colors? Add them and give each color its own sizes and
              quantities (the sizes above move under the first color).
            </p>
          </div>
        </>
      )}

      {hasColors || hasSizes ? (
        <p className="text-sm text-ink-soft">
          Total stock: <span className="font-medium text-ink">{totalQuantity}</span> — calculated
          from the quantities above. The product shows as Sold Out when everything is at 0.
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
