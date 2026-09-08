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
import { serializeProducts } from "@/lib/serialize";
import { categories } from "@/data/categories";

// Product data changes via the admin panel without a redeploy, so this page
// must be rendered per-request rather than cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const [rawProducts, rawCovers] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean(),
    CategoryCover.find().lean() as unknown as Promise<CategoryCoverDoc[]>,
  ]);
  const products = serializeProducts(rawProducts as Record<string, unknown>[]);
  const covers = Object.fromEntries(rawCovers.map((c) => [c.slug, c.image]));

  const hasAnyProducts = products.length > 0;

  return (
    <div>
      <Hero />
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
