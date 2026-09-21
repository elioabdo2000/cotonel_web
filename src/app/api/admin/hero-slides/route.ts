import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HeroSlideModel } from "@/models/HeroSlide";

export async function GET() {
  await connectDB();
  const slides = await HeroSlideModel.find().sort({ order: 1 });
  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, src, poster, alt, headline, subheading, ctaLabel, ctaHref, focus, order } = body ?? {};

  if (type !== "image" && type !== "video") {
    return NextResponse.json({ error: "Type must be image or video" }, { status: 400 });
  }
  if (typeof src !== "string" || !src.trim()) {
    return NextResponse.json({ error: "A photo or video is required" }, { status: 400 });
  }
  if (typeof alt !== "string" || !alt.trim()) {
    return NextResponse.json({ error: "Alt text is required" }, { status: 400 });
  }

  await connectDB();
  const slide = await HeroSlideModel.create({
    type,
    src,
    poster: typeof poster === "string" ? poster.trim() : undefined,
    alt: alt.trim(),
    headline: typeof headline === "string" ? headline.trim() : undefined,
    subheading: typeof subheading === "string" ? subheading.trim() : undefined,
    ctaLabel: typeof ctaLabel === "string" ? ctaLabel.trim() : undefined,
    ctaHref: typeof ctaHref === "string" ? ctaHref.trim() : undefined,
    focus: typeof focus === "string" ? focus.trim() : undefined,
    order: typeof order === "number" && !Number.isNaN(order) ? order : 0,
  });

  return NextResponse.json({ slide }, { status: 201 });
}
