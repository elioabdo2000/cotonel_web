import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HeroSlideModel } from "@/models/HeroSlide";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { type, src, poster, alt, headline, subheading, ctaLabel, ctaHref, focus, order } = body ?? {};

  const updates: Record<string, unknown> = {};
  if (type === "image" || type === "video") updates.type = type;
  if (typeof src === "string" && src.trim()) updates.src = src;
  if (typeof poster === "string") updates.poster = poster.trim();
  if (typeof alt === "string" && alt.trim()) updates.alt = alt.trim();
  if (typeof headline === "string") updates.headline = headline.trim();
  if (typeof subheading === "string") updates.subheading = subheading.trim();
  if (typeof ctaLabel === "string") updates.ctaLabel = ctaLabel.trim();
  if (typeof ctaHref === "string") updates.ctaHref = ctaHref.trim();
  if (typeof focus === "string") updates.focus = focus.trim();
  if (typeof order === "number" && !Number.isNaN(order)) updates.order = order;

  await connectDB();
  const slide = await HeroSlideModel.findByIdAndUpdate(id, updates, { new: true });
  if (!slide) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }
  return NextResponse.json({ slide });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const deleted = await HeroSlideModel.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
