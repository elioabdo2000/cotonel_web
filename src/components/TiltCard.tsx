"use client";

import { useRef } from "react";

// Wraps a photo (or any element) with a subtle mouse-following 3D tilt —
// the kind of tactile depth luxury sites use instead of a flat hover state.
// Pure CSS transforms, no library. Does nothing on touch devices (no mouse
// to follow), so it never gets in the way on phones.
export default function TiltCard({
  children,
  className = "",
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${(x * intensity).toFixed(2)}deg) rotateX(${(-y * intensity).toFixed(2)}deg)`;
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
