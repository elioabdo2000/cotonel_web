"use client";

import Photo from "./Photo";
import OrderButton from "./OrderButton";
import TiltCard from "./TiltCard";
import { useProductModal } from "./ProductModalContext";
import { stockState } from "@/lib/stock";
import type { ProductDoc } from "@/models/Product";

export default function ProductCard({
  product,
  accent,
}: {
  product: ProductDoc;
  accent: "sage" | "blue" | "blush";
}) {
  const { open } = useProductModal();
  const stock = stockState(product.stock);
  const isOnSale = Boolean(product.onSale && product.salePrice);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream-raised shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <button
        type="button"
        onClick={() => open(product)}
        className="relative block w-full overflow-hidden text-left"
        aria-label={`View details for ${product.name}`}
      >
        <TiltCard intensity={6}>
          <Photo
            src={product.image}
            alt={product.name}
            accent={accent}
            className={`aspect-[4/5] w-full scale-100 object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
              stock.soldOut ? "opacity-60 saturate-50" : ""
            }`}
          />
        </TiltCard>
        {(stock.soldOut || stock.urgent || stock.low) && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-medium text-cream-raised ${
              stock.soldOut ? "bg-ink-soft" : stock.urgent ? "bg-blush-deep" : "bg-blush-deep/80"
            }`}
          >
            {stock.label}
          </span>
        )}
        {isOnSale && (
          <span className="absolute right-2 top-2 rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[11px] font-medium text-cream-raised">
            Sale
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 translate-y-full bg-black/45 py-1.5 text-center text-xs font-medium text-cream-raised opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View details
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <button type="button" onClick={() => open(product)} className="text-left">
          <h3 className="text-sm font-medium text-ink">{product.name}</h3>
          {isOnSale ? (
            <p className="mt-0.5 flex items-baseline gap-2 text-sm">
              {product.price && <span className="text-ink-faint line-through">{product.price}</span>}
              <span className="font-medium text-blush-deep">{product.salePrice}</span>
            </p>
          ) : (
            product.price && <p className="mt-0.5 text-sm text-ink-soft">{product.price}</p>
          )}
        </button>
        <div className="mt-auto">
          <OrderButton productName={product.name} productImage={product.image} full />
        </div>
      </div>
    </div>
  );
}
