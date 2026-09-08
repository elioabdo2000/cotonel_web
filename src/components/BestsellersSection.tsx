import ProductCard from "./ProductCard";
import { categoryBySlug } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

// Highlights a hand-picked set of products right on the homepage — toggled
// per-product via "Show in the Bestsellers section" in the admin form.
export default function BestsellersSection({ products }: { products: ProductDoc[] }) {
  const picks = products.filter((p) => p.bestseller);
  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
        Bestsellers
      </p>
      <h2 className="font-display mt-2 text-center text-2xl italic text-ink sm:text-3xl">
        Loved again and again
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {picks.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            accent={categoryBySlug(product.category)?.accent ?? "sage"}
          />
        ))}
      </div>
    </section>
  );
}
