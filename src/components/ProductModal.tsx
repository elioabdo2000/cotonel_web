"use client";

import { useEffect, useState } from "react";
import Photo from "./Photo";
import type { ProductDoc } from "@/models/Product";
import { site } from "@/data/site";

// Pops open with everything a shopper needs before ordering: price, sizes,
// colors, and how many are left. Once the site is wired up to Cotonel store
// management, `stock` (and the rest of this data) will come from there
// instead of the manual admin form.
export default function ProductModal({
  product,
  onClose,
}: {
  product: ProductDoc | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  // Reset picks (and the gallery position) whenever a new product opens, and close on Esc.
  useEffect(() => {
    setSize(null);
    setColor(null);
    setActiveImage(0);
    if (!product) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  const gallery = [product.image, ...(product.images ?? [])];
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const isOnSale = Boolean(product.onSale && product.salePrice);

  const parts = [`Hi! I'm interested in the ${product.name}`];
  if (size) parts.push(`size ${size}`);
  if (color) parts.push(`in ${color}`);
  const message = `${parts.join(", ")} — is it available?`;
  const whatsappHref = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-cream-raised sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Photo
            src={gallery[activeImage]}
            alt={product.name}
            className="aspect-[4/3] w-full rounded-t-3xl object-cover sm:rounded-t-3xl"
          />
          {isOnSale && (
            <span className="absolute left-4 top-4 rounded-full bg-[var(--color-gold)] px-3 py-1 text-xs font-medium text-cream-raised">
              Sale
            </span>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-cream-raised/90 text-ink shadow-sm transition hover:bg-cream-raised"
          >
            ✕
          </button>

          {gallery.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => setActiveImage(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeImage ? "w-5 bg-cream-raised" : "w-1.5 bg-cream-raised/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-6 pt-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === activeImage ? "ring-ink" : "ring-transparent"
                }`}
              >
                <Photo src={url} alt={`${product.name} photo ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:p-8 sm:pb-8">
          <h2 className="font-display text-2xl text-ink">{product.name}</h2>
          {isOnSale ? (
            <p className="mt-1 flex items-baseline gap-2 text-lg">
              {product.price && <span className="text-ink-faint line-through">{product.price}</span>}
              <span className="font-medium text-blush-deep">{product.salePrice}</span>
            </p>
          ) : (
            product.price && <p className="mt-1 text-lg text-ink-soft">{product.price}</p>
          )}

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.description}</p>
          )}

          {product.stock !== undefined && (
            <p
              className={`mt-4 text-sm font-medium ${
                outOfStock ? "text-blush-deep" : lowStock ? "text-blush-deep" : "text-sage-deep"
              }`}
            >
              {outOfStock
                ? "Out of stock"
                : lowStock
                  ? `Only ${product.stock} left`
                  : `${product.stock} in stock`}
            </p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-ink-soft">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s === size ? null : s)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      s === size
                        ? "border-ink bg-ink text-cream-raised"
                        : "border-line text-ink hover:border-sage"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-ink-soft">Color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c === color ? null : c)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      c === color
                        ? "border-ink bg-ink text-cream-raised"
                        : "border-line text-ink hover:border-sage"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!outOfStock ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-whatsapp)] px-5 py-3 text-sm font-medium text-cream-raised transition hover:brightness-110"
            >
              Order on WhatsApp
            </a>
          ) : (
            <p className="mt-7 text-sm text-ink-faint">
              This piece is currently out of stock — follow{" "}
              <a href={site.instagram} target="_blank" rel="noreferrer" className="underline">
                Instagram
              </a>{" "}
              for restocks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
