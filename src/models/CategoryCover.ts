import mongoose, { Schema, models, model } from "mongoose";

// A manually-chosen photo for a category's homepage circle, independent of
// any product. If a category has no cover here, the site falls back to
// using its featured product's photo instead (see CategoryCircles.tsx).
export interface CategoryCoverDoc {
  _id: string;
  slug: string; // matches a slug in data/categories.ts
  image: string;
}

const CategoryCoverSchema = new Schema<CategoryCoverDoc>({
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
});

// See models/Product.ts for why this stale-model check exists — same
// Next.js-dev + Mongoose caching gotcha applies to every model here.
function resolveModel() {
  const existing = models.CategoryCover as mongoose.Model<CategoryCoverDoc> | undefined;
  const isStale =
    existing && Object.keys(CategoryCoverSchema.paths).some((key) => !(key in existing.schema.paths));
  if (isStale) delete models.CategoryCover;
  return (
    (models.CategoryCover as mongoose.Model<CategoryCoverDoc> | undefined) ??
    model<CategoryCoverDoc>("CategoryCover", CategoryCoverSchema)
  );
}

export const CategoryCover = resolveModel();
export default CategoryCover as mongoose.Model<CategoryCoverDoc>;
