import Link from "next/link";
import { connectDB } from "@/lib/db";
import { HeroSlideModel, type HeroSlideDoc } from "@/models/HeroSlide";
import DeleteHeroSlideButton from "@/components/admin/DeleteHeroSlideButton";

export const dynamic = "force-dynamic";

export default async function HeroSlidesPage() {
  await connectDB();
  const slides = (await HeroSlideModel.find()
    .sort({ order: 1 })
    .lean()) as unknown as HeroSlideDoc[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Homepage carousel</h1>
          <p className="mt-1 max-w-lg text-sm text-ink-soft">
            These are the slides shown at the top of the homepage. If you haven&apos;t added any
            here yet, the site shows a set of built-in placeholder slides instead.
          </p>
        </div>
        <Link
          href="/admin/hero/new"
          className="flex-shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream-raised transition hover:bg-sage-deep"
        >
          + Add slide
        </Link>
      </div>

      {slides.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">
          No custom slides yet — the site is showing the built-in placeholder carousel. Add a
          slide here to replace it.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-cream-raised">
          {slides.map((slide) => {
            const id = String(slide._id);
            return (
              <div key={id} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-sage-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.type === "video" ? slide.poster || slide.src : slide.src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    {slide.headline || slide.alt}
                    <span className="ml-2 text-xs text-ink-faint">
                      ({slide.type}, order {slide.order})
                    </span>
                  </p>
                  {slide.subheading && <p className="text-xs text-ink-soft">{slide.subheading}</p>}
                </div>
                <Link
                  href={`/admin/hero/${id}/edit`}
                  className="text-sm text-ink-soft transition hover:text-ink"
                >
                  Edit
                </Link>
                <DeleteHeroSlideButton id={id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
