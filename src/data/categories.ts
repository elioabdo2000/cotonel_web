export interface CategoryMeta {
  slug: string;
  label: string;
  blurb: string;
  accent: "sage" | "blue" | "blush";
}

// The five shop sections. Adding a new one here makes it selectable in the
// admin product form and gives it a homepage section automatically.
export const categories: CategoryMeta[] = [
  {
    slug: "lingerie",
    label: "Lingerie & Underwear",
    blurb: "Pure cotton, cut close to the body, made to disappear under everything.",
    accent: "blush",
  },
  {
    slug: "sleepwear",
    label: "Sleepwear & Pajamas",
    blurb: "Breathable sets for winding down, in both women's and men's fits.",
    accent: "sage",
  },
  {
    slug: "bedding",
    label: "Bedding",
    blurb: "Duvet sets and covers in patterns that hold up wash after wash.",
    accent: "sage",
  },
  {
    slug: "baby",
    label: "Baby & Kids",
    blurb: "Soft cotton basics for the smallest members of the family.",
    accent: "blue",
  },
  {
    slug: "sportswear",
    label: "Sportswear",
    blurb: "Everyday activewear in the same soft cotton the rest of the shop is built on.",
    accent: "blue",
  },
];

export function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
