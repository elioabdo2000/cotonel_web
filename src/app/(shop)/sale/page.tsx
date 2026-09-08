import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { serializeProducts } from "@/lib/serialize";
import { categoryBySlug } from "@/data/categories";

// A dedicated page for everything currently on sale — same idea as each
// category having its own page, so "Sale" isn't just a homepage strip.
export const dynamic = "force-dynamic";

export default async function SalePage() {
  await connectDB();
  const raw = await Product.find({ onSale: true }).sort({ createdAt: -1 }).lean();
  const products = serializeProducts(raw as Record<string, unknown>[]).filter((p) => p.salePrice);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link href="/" className="text-sm text-ink-soft transition hover:text-ink">
          ← Back to home
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
          Limited time
        </p>
        <h1 className="font-display mt-2 text-center text-3xl italic text-ink sm:text-4xl">On Sale</h1>

        {products.length === 0 ? (
          <p className="mt-10 text-center text-sm text-ink-soft">
            Nothing on sale right now — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                accent={categoryBySlug(product.category)?.accent ?? "sage"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
