import Photo from "./Photo";
import GenderTabs from "./GenderTabs";
import type { CategoryMeta } from "@/data/categories";
import type { ProductDoc } from "@/models/Product";

const ACCENT_TEXT: Record<CategoryMeta["accent"], string> = {
  sage: "text-sage-deep",
  blue: "text-blue-deep",
  blush: "text-blush-deep",
};

export default function CategorySection({
  category,
  products,
  index,
}: {
  category: CategoryMeta;
  products: ProductDoc[];
  index: number;
}) {
  const reversed = index % 2 === 1;
  const heroProduct = products.find((p) => p.featured) ?? products[0];

  return (
    <section id={category.slug} className="border-t border-line py-16 first:border-t-0 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`grid items-center gap-10 lg:grid-cols-[0.85fr_1fr] ${
            reversed ? "lg:[direction:rtl]" : ""
          }`}
        >
          <Photo
            src={heroProduct.image}
            alt={`${category.label} — lifestyle photo`}
            accent={category.accent}
            className="aspect-[4/3] w-full rounded-2xl object-cover lg:[direction:ltr]"
          />

          <div className="lg:[direction:ltr]">
            <p className={`font-display text-sm italic ${ACCENT_TEXT[category.accent]}`}>
              {category.label}
            </p>
            <h2 className="font-display mt-2 max-w-md text-3xl leading-tight text-ink sm:text-4xl">
              {category.blurb}
            </h2>
          </div>
        </div>

        <GenderTabs products={products} accent={category.accent} />
      </div>
    </section>
  );
}
