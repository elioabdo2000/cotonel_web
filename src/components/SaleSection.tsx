import Link from "next/link";
import ProductCard from "./ProductCard";
import { categoryBySlug } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

// Products marked "on sale" (with a sale price set) in the admin form.
// The heading links through to /sale, which lists all of them on their own
// page — this strip is just a homepage preview, not the only place to see it.
export default function SaleSection({ products }: { products: ProductDoc[] }) {
  const picks = products.filter((p) => p.onSale && p.salePrice);
  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
        Limited time
      </p>
      <Link href="/sale" className="group mt-2 block text-center">
        <h2 className="font-display inline-flex items-center gap-2 text-2xl italic text-ink sm:text-3xl">
          On Sale
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </h2>
      </Link>

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
