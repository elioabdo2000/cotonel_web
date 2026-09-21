"use client";

import { useRef } from "react";
import type { TouchEvent } from "react";

// Detects a left/right finger swipe on whatever element you spread these
// handlers onto. Plain touch events, no library — works everywhere.
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 40) {
  const startX = useRef<number | null>(null);

  function onTouchStart(e: TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: TouchEvent) {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (delta <= -threshold) onSwipeLeft();
    else if (delta >= threshold) onSwipeRight();
  }

  return { onTouchStart, onTouchEnd };
}
