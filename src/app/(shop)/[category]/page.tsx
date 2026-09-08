import Link from "next/link";
import { notFound } from "next/navigation";
import CategorySection from "@/components/CategorySection";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { serializeProducts } from "@/lib/serialize";
import { categoryBySlug } from "@/data/categories";

// Each category now has its own page (e.g. /bedding) instead of being an
// anchor section on the homepage — visiting it shows only that category.
export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categoryBySlug(slug);
  if (!category) notFound();

  await connectDB();
  const raw = await Product.find({ category: slug }).sort({ createdAt: -1 }).lean();
  const products = serializeProducts(raw as Record<string, unknown>[]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link href="/" className="text-sm text-ink-soft transition hover:text-ink">
          ← Back to home
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mx-auto max-w-6xl px-6 py-20 text-center text-ink-soft">
          No {category.label.toLowerCase()} yet — check back soon.
        </p>
      ) : (
        <CategorySection category={category} products={products} index={0} />
      )}
    </div>
  );
}
