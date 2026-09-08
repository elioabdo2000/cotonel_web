"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { heroSlides } from "@/data/heroSlides";

const AUTOPLAY_MS = 15000;

// The homepage cover carousel. Each slide can be a photo or a video (see
// data/heroSlides.ts). Photo slides auto-advance on a timer; a video slide
// advances itself when the clip ends, so nothing gets cut off mid-play.
export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const slide = heroSlides[index];

  const goTo = useCallback((next: number) => {
    setIndex((next + heroSlides.length) % heroSlides.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (paused || slide.type === "video" || heroSlides.length <= 1) return;
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, slide.type, next]);

  useEffect(() => {
    if (slide.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        /* autoplay can be blocked before user interaction — fine, poster shows */
      });
    }
  }, [index, slide.type]);

  return (
    <section
      className="relative mx-auto max-w-6xl overflow-hidden px-0 sm:px-6 sm:pt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink shadow-lg sm:aspect-[16/8] sm:rounded-3xl sm:shadow-xl">
        {slide.type === "video" ? (
          <video
            ref={videoRef}
            key={slide.src}
            src={slide.src}
            poster={slide.poster}
            muted
            playsInline
            autoPlay
            onEnded={next}
            style={{ objectPosition: slide.focus ?? "center" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 640px) 100vw, 1152px"
            priority={index === 0}
            style={{ objectFit: "cover", objectPosition: slide.focus ?? "center" }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-cream-raised/75 sm:text-xs">
            Cotonel
          </p>
          {slide.headline && (
            <h1 className="font-display mt-2 max-w-lg text-3xl italic leading-tight text-cream-raised sm:text-5xl">
              {slide.headline}
            </h1>
          )}
          {slide.subheading && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-raised/85 sm:text-base">
              {slide.subheading}
            </p>
          )}
          {slide.ctaLabel && slide.ctaHref && (
            <a
              href={slide.ctaHref}
              className="mt-5 inline-block rounded-full bg-cream-raised px-6 py-3 text-sm font-medium text-ink transition hover:bg-cream"
            >
              {slide.ctaLabel}
            </a>
          )}
        </div>

        {heroSlides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/25 p-3 text-cream-raised transition hover:bg-black/40 sm:left-5"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/25 p-3 text-cream-raised transition hover:bg-black/40 sm:right-5"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        )}
      </div>

      {heroSlides.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1">
          {heroSlides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="flex items-center justify-center p-2.5"
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-ink" : "w-2 bg-ink-faint/50"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
