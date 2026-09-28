import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { categories } from "@/data/categories";
import { cleanColorStock, cleanSizeStock, deriveFromColorStock, totalStock } from "@/lib/stock";

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
    colors,
    colorStock,
    sizeStock,
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

  // Colors, each with their own sizes + quantities. If there are any, they decide the
  // product's sizes and total stock (the plain size list below is then ignored).
  const cleanedColors = colorStock === undefined ? [] : cleanColorStock(colorStock);
  if (cleanedColors === null) {
    return NextResponse.json(
      { error: "Each color needs a unique name, and sizes/quantities of 0 or more (whole numbers)" },
      { status: 400 }
    );
  }
  const hasColors = cleanedColors.length > 0;
  const derived = hasColors ? deriveFromColorStock(cleanedColors) : null;

  // Sizes with a quantity each. If there are any, the product's total stock is their sum.
  const cleanedSizes = sizeStock === undefined ? [] : cleanSizeStock(sizeStock);
  if (cleanedSizes === null) {
    return NextResponse.json(
      { error: "Each size needs a unique name and a quantity of 0 or more (whole numbers)" },
      { status: 400 }
    );
  }
  const hasSizes = cleanedSizes.length > 0;
  if (!hasColors && !hasSizes && (typeof stock !== "number" || Number.isNaN(stock) || stock < 0)) {
    return NextResponse.json({ error: "Stock is required (use 0 for sold out)" }, { status: 400 });
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
    ...(derived
      ? {
          colors: derived.colors,
          colorStock: cleanedColors,
          sizes: derived.sizes,
          sizeStock: derived.sizeStock,
          stock: derived.stock,
        }
      : {
          sizes: hasSizes ? cleanedSizes.map((s) => s.size) : undefined,
          sizeStock: hasSizes ? cleanedSizes : undefined,
          colors: Array.isArray(colors) && colors.length ? colors : undefined,
          stock: hasSizes ? totalStock(cleanedSizes) : stock,
        }),
  });

  return NextResponse.json({ product }, { status: 201 });
}
