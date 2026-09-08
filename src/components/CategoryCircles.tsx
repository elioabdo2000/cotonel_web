import Link from "next/link";
import Photo from "./Photo";
import TiltCard from "./TiltCard";
import type { CategoryMeta } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

// A horizontally-scrollable row of round category thumbnails, shown right
// under the cover carousel. The photo is either a manually-set cover (from
// /admin/categories) or, if none is set, the category's featured product
// photo — so there's always something sensible even before covers are set.
export default function CategoryCircles({
  categories,
  products,
  covers = {},
}: {
  categories: CategoryMeta[];
  products: ProductDoc[];
  covers?: Record<string, string>;
}) {
  const withThumbnails = categories
    .map((category) => {
      const inCategory = products.filter((p) => p.category === category.slug);
      const productThumb = inCategory.find((p) => p.featured) ?? inCategory[0];
      const image = covers[category.slug] ?? productThumb?.image;
      return { category, image };
    })
    .filter((c): c is { category: CategoryMeta; image: string } => Boolean(c.image));

  if (withThumbnails.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
        Shop by category
      </p>

      <div className="relative mt-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-cream to-transparent sm:w-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-cream to-transparent sm:w-10" />

        <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
          {withThumbnails.map(({ category, image }) => (
            <Link
              key={category.slug}
              href={`/${category.slug}`}
              className="group flex flex-shrink-0 snap-start flex-col items-center gap-2.5"
            >
              <div className="h-20 w-20 overflow-hidden rounded-full shadow-md ring-1 ring-line transition-shadow duration-300 group-hover:shadow-xl group-hover:ring-sage sm:h-28 sm:w-28">
                <TiltCard intensity={14} className="h-full w-full">
                  <Photo
                    src={image}
                    alt={category.label}
                    accent={category.accent}
                    className="h-full w-full scale-110 object-cover"
                  />
                </TiltCard>
              </div>
              <span className="max-w-[6.5rem] text-center text-xs font-medium leading-tight text-ink-soft transition group-hover:text-ink sm:max-w-[7.5rem] sm:text-sm">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
