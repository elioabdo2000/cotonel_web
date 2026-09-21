import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { HeroSlideModel, type HeroSlideDoc } from "@/models/HeroSlide";
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const slide = (await HeroSlideModel.findById(id).lean()) as unknown as HeroSlideDoc | null;

  if (!slide) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Edit slide</h1>
      <div className="mt-6">
        <HeroSlideForm
          initial={{
            id: String(slide._id),
            type: slide.type,
            src: slide.src,
            poster: slide.poster ?? "",
            alt: slide.alt,
            headline: slide.headline ?? "",
            subheading: slide.subheading ?? "",
            ctaLabel: slide.ctaLabel ?? "",
            ctaHref: slide.ctaHref ?? "",
            focus: slide.focus ?? "",
            order: slide.order,
          }}
        />
      </div>
    </div>
  );
}
