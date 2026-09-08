import Link from "next/link";
import Photo from "./Photo";
import type { CategoryMeta } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

// The actual "large photo per category" section on the homepage — this is
// what the admin's "Use as this category's large homepage photo" checkbox
// is really for. Each tile prefers a manual cover (/admin/categories),
// then the featured product, then whatever product exists first.
export default function CategoryShowcase({
  categories,
  products,
  covers = {},
}: {
  categories: CategoryMeta[];
  products: ProductDoc[];
  covers?: Record<string, string>;
}) {
  const tiles = categories
    .map((category) => {
      const inCategory = products.filter((p) => p.category === category.slug);
      const productThumb = inCategory.find((p) => p.featured) ?? inCategory[0];
      const image = covers[category.slug] ?? productThumb?.image;
      return { category, image };
    })
    .filter((t): t is { category: CategoryMeta; image: string } => Boolean(t.image));

  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ category, image }) => (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            className="group relative block overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-xl"
          >
            <Photo
              src={image}
              alt={`${category.label} — shop the collection`}
              accent={category.accent}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="font-display flex items-center gap-2 text-sm italic text-cream-raised/90">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: `var(--color-${category.accent})` }}
                  aria-hidden="true"
                />
                {category.label}
              </p>
              <p className="mt-1 max-w-[14rem] text-sm leading-snug text-cream-raised/85">
                {category.blurb}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-cream-raised">
                Shop now
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
