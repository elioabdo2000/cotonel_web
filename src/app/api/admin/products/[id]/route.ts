import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { categories } from "@/data/categories";
import { cleanSizeStock, totalStock } from "@/lib/stock";

const categorySlugs = new Set(categories.map((c) => c.slug));

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const {
    name,
    price,
    description,
    category,
    image,
    images,
    gender,
    featured,
    bestseller,
    onSale,
    salePrice,
    colors,
    sizeStock,
    stock,
  } = body ?? {};

  const validGenders = new Set(["men", "women", "unisex"]);

  const updates: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof price === "string") updates.price = price.trim();
  if (typeof description === "string") updates.description = description.trim();
  if (typeof category === "string") {
    if (!categorySlugs.has(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    updates.category = category;
  }
  if (typeof image === "string" && image.trim()) updates.image = image;
  if (Array.isArray(images)) {
    updates.images = images.filter((i: unknown) => typeof i === "string").length
      ? images.filter((i: unknown) => typeof i === "string")
      : undefined;
  }
  if (typeof gender === "string") updates.gender = validGenders.has(gender) ? gender : undefined;
  if (typeof featured === "boolean") updates.featured = featured;
  if (typeof bestseller === "boolean") updates.bestseller = bestseller;
  if (typeof onSale === "boolean") updates.onSale = onSale;
  if (typeof salePrice === "string") updates.salePrice = salePrice.trim();
  if (sizeStock !== undefined) {
    const cleaned = cleanSizeStock(sizeStock);
    if (cleaned === null) {
      return NextResponse.json(
        { error: "Each size needs a unique name and a quantity of 0 or more (whole numbers)" },
        { status: 400 }
      );
    }
    if (cleaned.length) {
      updates.sizeStock = cleaned;
      updates.sizes = cleaned.map((s) => s.size);
      updates.stock = totalStock(cleaned); // total is always the sum of the sizes
    } else {
      // no sizes any more — remove them and fall back to the plain stock number
      unset.sizeStock = 1;
      unset.sizes = 1;
    }
  }
  if (Array.isArray(colors)) updates.colors = colors.length ? colors : undefined;
  if (stock !== undefined && updates.stock === undefined) {
    if (typeof stock !== "number" || Number.isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock must be 0 or more" }, { status: 400 });
    }
    updates.stock = stock;
  }

  await connectDB();
  const update: Record<string, unknown> = { $set: updates };
  if (Object.keys(unset).length) update.$unset = unset;
  const product = await Product.findByIdAndUpdate(id, update, { new: true });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
