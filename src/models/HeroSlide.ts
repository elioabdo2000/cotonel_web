import mongoose, { Schema, models, model } from "mongoose";

// A single homepage carousel slide, managed from /admin/hero instead of
// being hardcoded. Falls back to data/heroSlides.ts on the homepage if none
// exist yet, so the site never looks empty before the admin adds any.
export interface HeroSlideDoc {
  _id: string;
  type: "image" | "video";
  src: string; // Cloudinary/UploadThing URL
  poster?: string; // shown while a video slide loads
  alt: string;
  headline?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  // CSS object-position ("center", "top", "20% 10%"...) — controls which
  // part of the photo stays visible when cropped into the banner shape.
  focus?: string;
  order: number; // lower shows first
}

const HeroSlideSchema = new Schema<HeroSlideDoc>({
  type: { type: String, enum: ["image", "video"] as const, required: true },
  src: { type: String, required: true },
  poster: { type: String, trim: true },
  alt: { type: String, required: true, trim: true },
  headline: { type: String, trim: true },
  subheading: { type: String, trim: true },
  ctaLabel: { type: String, trim: true },
  ctaHref: { type: String, trim: true },
  focus: { type: String, trim: true },
  order: { type: Number, default: 0 },
});

// See models/Product.ts for why this stale-model self-heal check exists.
function resolveModel() {
  const existing = models.HeroSlide as mongoose.Model<HeroSlideDoc> | undefined;
  const isStale =
    existing && Object.keys(HeroSlideSchema.paths).some((key) => !(key in existing.schema.paths));
  if (isStale) delete models.HeroSlide;
  return (
    (models.HeroSlide as mongoose.Model<HeroSlideDoc> | undefined) ??
    model<HeroSlideDoc>("HeroSlide", HeroSlideSchema)
  );
}

export const HeroSlideModel = resolveModel();
export default HeroSlideModel as mongoose.Model<HeroSlideDoc>;
