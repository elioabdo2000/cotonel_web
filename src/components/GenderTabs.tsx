"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { ProductDoc } from "@/models/Product";
import type { CategoryMeta } from "@/data/categories";

type Filter = "all" | "women" | "men";

// Renders the product grid for a category page, with an All / Women / Men
// filter toggle above it. The toggle is always shown — untagged products
// (no gender set yet) appear under every tab so nothing looks like it
// vanished, and as products get tagged in the admin, the filter starts
// actually narrowing things down.
export default function GenderTabs({
  products,
  accent,
}: {
  products: ProductDoc[];
  accent: CategoryMeta["accent"];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible =
    filter === "all"
      ? products
      : products.filter((p) => p.gender === filter || p.gender === "unisex" || !p.gender);

  return (
    <div className="mt-10">
      {products.length > 1 && (
        <div className="mb-6 flex justify-center gap-2">
          {(["all", "women", "men"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                filter === f
                  ? "bg-ink text-cream-raised"
                  : "border border-line text-ink-soft hover:border-sage"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product._id} product={product} accent={accent} />
        ))}
      </div>
    </div>
  );
}
