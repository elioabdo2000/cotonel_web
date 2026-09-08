import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { categories } from "@/data/categories";

const categorySlugs = new Set(categories.map((c) => c.slug));

export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
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
    sizes,
    colors,
    stock,
  } = body ?? {};

  const validGenders = new Set(["men", "women", "unisex"]);

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  if (typeof category !== "string" || !categorySlugs.has(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (typeof image !== "string" || !image.trim()) {
    return NextResponse.json({ error: "Product photo is required" }, { status: 400 });
  }

  await connectDB();
  const product = await Product.create({
    name: name.trim(),
    price: typeof price === "string" ? price.trim() : undefined,
    description: typeof description === "string" ? description.trim() : undefined,
    category,
    image,
    images:
      Array.isArray(images) && images.length
        ? images.filter((i: unknown) => typeof i === "string")
        : undefined,
    gender: validGenders.has(gender) ? gender : undefined,
    featured: Boolean(featured),
    bestseller: Boolean(bestseller),
    onSale: Boolean(onSale),
    salePrice: typeof salePrice === "string" ? salePrice.trim() : undefined,
    sizes: Array.isArray(sizes) && sizes.length ? sizes : undefined,
    colors: Array.isArray(colors) && colors.length ? colors : undefined,
    stock: typeof stock === "number" && !Number.isNaN(stock) ? stock : undefined,
  });

  return NextResponse.json({ product }, { status: 201 });
}
