import mongoose, { Schema, models, model } from "mongoose";
import { categories } from "@/data/categories";

const categorySlugs = categories.map((c) => c.slug);

export interface ProductDoc {
  _id: string;
  name: string;
  price?: string;
  description?: string; // shown in the product details popup
  category: string;
  image: string; // Cloudinary secure_url — the cover photo, used everywhere on the site
  images?: string[]; // extra gallery photos — only shown in the product details popup
  gender?: "men" | "women" | "unisex"; // powers the Men/Women tabs on a category page
  featured?: boolean; // shown as the category's large lifestyle photo
  bestseller?: boolean; // shown in the homepage Bestsellers section
  onSale?: boolean; // shows salePrice struck-through against price, and lists in the Sale section
  salePrice?: string; // the discounted price — only shown/used while onSale is true
  sizes?: string[]; // e.g. ["S", "M", "L"] — leave empty to hide the size picker
  colors?: string[]; // e.g. ["Black", "Ivory"] — leave empty to hide the color picker
  stock?: number; // units left. Leave unset to hide stock info entirely.
  createdAt: Date;
}

const ProductSchema = new Schema<ProductDoc>({
  name: { type: String, required: true, trim: true },
  price: { type: String, trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: true, enum: categorySlugs },
  image: { type: String, required: true },
  images: { type: [String], default: undefined },
  gender: { type: String, enum: ["men", "women", "unisex"] },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  salePrice: { type: String, trim: true },
  sizes: { type: [String], default: undefined },
  colors: { type: [String], default: undefined },
  stock: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

// In Next.js dev, editing this file doesn't restart the Node process — and
// Mongoose caches the compiled model globally the first time it's used. If
// a field gets added to the schema above (like `bestseller` did) while an
// old compiled model is still cached, that field is silently dropped on
// every save with no error. This checks for that mismatch and recompiles
// automatically instead of requiring a manual dev-server restart each time.
function resolveModel() {
  const existing = models.Product as mongoose.Model<ProductDoc> | undefined;
  const isStale = existing && Object.keys(ProductSchema.paths).some((key) => !(key in existing.schema.paths));
  if (isStale) delete models.Product;
  return (models.Product as mongoose.Model<ProductDoc> | undefined) ?? model<ProductDoc>("Product", ProductSchema);
}

export const Product = resolveModel();
export default Product as mongoose.Model<ProductDoc>;
