import Hero from "@/components/Hero";
import GoldDivider from "@/components/GoldDivider";
import CategoryShowcase from "@/components/CategoryShowcase";
import CategoryCircles from "@/components/CategoryCircles";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import SaleSection from "@/components/SaleSection";
import BestsellersSection from "@/components/BestsellersSection";
import Reveal from "@/components/Reveal";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { CategoryCover, type CategoryCoverDoc } from "@/models/CategoryCover";
import { HeroSlideModel, type HeroSlideDoc } from "@/models/HeroSlide";
import { serializeProducts } from "@/lib/serialize";
import { categories } from "@/data/categories";
import { heroSlides as fallbackHeroSlides } from "@/data/heroSlides";

// Product data changes via the admin panel without a redeploy, so this page
// must be rendered per-request rather than cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const [rawProducts, rawCovers, rawHeroSlides] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean(),
    CategoryCover.find().lean() as unknown as Promise<CategoryCoverDoc[]>,
    HeroSlideModel.find().sort({ order: 1 }).lean() as unknown as Promise<HeroSlideDoc[]>,
  ]);
  const products = serializeProducts(rawProducts as Record<string, unknown>[]);
  const covers = Object.fromEntries(rawCovers.map((c) => [c.slug, c.image]));

  // No admin-managed slides yet (/admin/hero) — show the built-in set
  // instead of an empty carousel. Once any slide is added there, it takes
  // over completely.
  const heroSlides =
    rawHeroSlides.length > 0
      ? rawHeroSlides.map((s) => ({
          type: s.type,
          src: s.src,
          poster: s.poster,
          alt: s.alt,
          headline: s.headline,
          subheading: s.subheading,
          ctaLabel: s.ctaLabel,
          ctaHref: s.ctaHref,
          focus: s.focus,
        }))
      : fallbackHeroSlides;

  const hasAnyProducts = products.length > 0;

  return (
    <div>
      <Hero slides={heroSlides} />
      <GoldDivider />
      <Reveal>
        <CategoryCircles categories={categories} products={products} covers={covers} />
      </Reveal>
      <Reveal>
        <CategoryShowcase categories={categories} products={products} covers={covers} />
      </Reveal>
      <Reveal>
        <NewArrivalsSection products={products} />
      </Reveal>
      <Reveal>
        <SaleSection products={products} />
      </Reveal>
      <Reveal>
        <BestsellersSection products={products} />
      </Reveal>
      {!hasAnyProducts && (
        <p className="mx-auto max-w-6xl px-6 py-20 text-center text-ink-soft">
          Products are on their way — check back soon, or follow us on Instagram in the meantime.
        </p>
      )}
    </div>
  );
}
