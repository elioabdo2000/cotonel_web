// The cover carousel at the top of the homepage. Add, remove, or reorder
// slides here — each one can be a photo or a video. Drop your files in
// /public/images or /public/videos (at the project root, next to /src —
// not inside it) and point src at them, using the EXACT filename
// including extension (a common mistake: saving a PNG but naming it
// "photo.jpg" — the browser needs the real one).
//
// Video slides autoplay muted + looped (silent, like an Instagram Reel
// cover) and use `poster` as the fallback frame while the video loads.

export interface HeroSlide {
  type: "image" | "video";
  src: string;
  poster?: string; // shown while a video slide loads, and used as a fallback
  alt: string;
  headline?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  // Controls which part of the photo stays visible when it's cropped to fit
  // the wide banner shape (CSS object-position: "center", "top", "20% 10%"…).
  // Tall/portrait photos especially need this — without it the crop is just
  // centered, which often cuts off faces or logos near the top or bottom.
  focus?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    type: "image",
    src: "/images/hero-1.png",
    alt: "Cotonel — men's pajamas",
    focus: "top",
    headline: "Where comfort meets elegance.",
    subheading: "Pure cotton sleepwear, cut for a night that actually rests you.",
    ctaLabel: "Shop sleepwear",
    ctaHref: "/sleepwear",
  },
  {
    type: "image",
    src: "/images/hero-2.png",
    alt: "Cotonel — striped bedding",
    focus: "center",
    headline: "Bedding that softens every wash.",
    subheading: "Duvet sets and covers in patterns built to last.",
    ctaLabel: "Shop bedding",
    ctaHref: "/bedding",
  },
  {
    type: "image",
    src: "/images/hero-3.png",
    alt: "Cotonel — sportswear",
    focus: "top",
    headline: "Everyday activewear, soft cotton inside.",
    subheading: "Built for movement without giving up comfort.",
    ctaLabel: "Shop sportswear",
    ctaHref: "/sportswear",
  },
  {
    type: "image",
    src: "/images/hero-4.png",
    alt: "Cotonel — activewear",
    focus: "top",
    headline: "Made to move with you.",
    subheading: "Breathable fits for every kind of day.",
    ctaLabel: "Shop sportswear",
    ctaHref: "/sportswear",
  },
  {
    type: "image",
    src: "/images/hero-5.jpg",
    alt: "Cotonel — women's pajamas",
    focus: "top",
    headline: "Slow mornings, soft fabric.",
    subheading: "Sleepwear made to be lived in.",
    ctaLabel: "Shop sleepwear",
    ctaHref: "/sleepwear",
  },

  // Example of a video slide — uncomment and point at your own clip once
  // you have one. It will autoplay silently and move to the next slide
  // when it finishes (no fixed timer, unlike the photo slides above).
  // {
  //   type: "video",
  //   src: "/videos/hero-video.mp4",
  //   poster: "/images/hero-1.png",
  //   alt: "Cotonel — video",
  //   headline: "New season, same softness.",
  //   ctaLabel: "Shop new arrivals",
  //   ctaHref: "/sleepwear",
  // },
];
