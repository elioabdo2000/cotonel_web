"use client";

import { useState } from "react";

const TINTS = {
  sage: "linear-gradient(135deg, var(--color-sage-soft), var(--color-cream))",
  blue: "linear-gradient(135deg, var(--color-blue-soft), var(--color-cream))",
  blush: "linear-gradient(135deg, var(--color-blush-soft), var(--color-cream))",
};

interface PhotoProps {
  src: string;
  alt: string;
  accent?: keyof typeof TINTS;
  className?: string;
  style?: React.CSSProperties;
}

// Renders the real photo once it exists at /public + src. Until then (or if
// it fails to load), shows a soft tinted placeholder labeled with the alt
// text, so the site looks intentional rather than broken while photos are
// still being added.
export default function Photo({ src, alt, accent = "sage", className = "", style }: PhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`photo-placeholder ${className}`}
        style={{ "--placeholder-tint": TINTS[accent], ...style } as React.CSSProperties}
      >
        <span className="photo-placeholder__label">{alt}</span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} style={style} />;
}
