import ProductCard from "./ProductCard";
import { categoryBySlug } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

// Unlike Bestsellers/Sale, nothing needs to be checked in the admin for
// this one — it just shows whatever you added most recently, so the
// homepage keeps looking current on its own as the catalog grows.
export default function NewArrivalsSection({ products }: { products: ProductDoc[] }) {
  const recent = products.slice(0, 8);
  if (recent.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
        Just in
      </p>
      <h2 className="font-display mt-2 text-center text-2xl italic text-ink sm:text-3xl">
        New Arrivals
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {recent.map((product) => (
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
