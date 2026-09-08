import { connectDB } from "@/lib/db";
import { Product, type ProductDoc } from "@/models/Product";
import { CategoryCover, type CategoryCoverDoc } from "@/models/CategoryCover";
import { categories } from "@/data/categories";
import CategoryCoverForm from "@/components/admin/CategoryCoverForm";

export const dynamic = "force-dynamic";

export default async function CategoryCoversPage() {
  await connectDB();
  const [products, covers] = await Promise.all([
    Product.find().lean() as unknown as Promise<ProductDoc[]>,
    CategoryCover.find().lean() as unknown as Promise<CategoryCoverDoc[]>,
  ]);

  const coverBySlug = new Map(covers.map((c) => [c.slug, c.image]));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Category covers</h1>
      <p className="mt-2 max-w-lg text-sm text-ink-soft">
        This is the photo shown for each category on the homepage — both the large showcase tile
        and the round circle underneath it. Upload one here to set it directly — otherwise it
        falls back to whichever product is marked &quot;featured&quot; for that category.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {categories.map((category) => {
          const inCategory = products.filter((p) => p.category === category.slug);
          const fallback = inCategory.find((p) => p.featured) ?? inCategory[0];
          return (
            <CategoryCoverForm
              key={category.slug}
              slug={category.slug}
              label={category.label}
              currentImage={coverBySlug.get(category.slug)}
              fallbackImage={fallback?.image}
            />
          );
        })}
      </div>
    </div>
  );
}
