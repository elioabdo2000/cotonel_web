import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CategoryCover } from "@/models/CategoryCover";
import { categoryBySlug } from "@/data/categories";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!categoryBySlug(slug)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const body = await req.json();
  const { image } = body ?? {};
  if (typeof image !== "string" || !image.trim()) {
    return NextResponse.json({ error: "Photo is required" }, { status: 400 });
  }

  await connectDB();
  const cover = await CategoryCover.findOneAndUpdate(
    { slug },
    { slug, image },
    { upsert: true, new: true }
  );

  return NextResponse.json({ cover });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  await CategoryCover.findOneAndDelete({ slug });
  return NextResponse.json({ ok: true });
}
