"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl italic text-ink" onClick={() => setOpen(false)}>
          Cotonel
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex">
          {categories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="transition hover:text-ink">
              {c.label}
            </Link>
          ))}
          <Link href="/sale" className="font-medium text-[var(--color-gold)] transition hover:brightness-90">
            Sale
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/cotonel.lb"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:border-sage hover:text-sage-deep sm:inline-block"
          >
            Instagram
          </a>

          {/* Hamburger — every category link lives behind the desktop nav's
              `md:flex`, so phones need their own way in or they simply
              can't browse categories at all. */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-sage md:hidden"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-6 py-4 md:hidden">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm text-ink-soft transition hover:bg-cream-raised hover:text-ink"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/sale"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-medium text-[var(--color-gold)] transition hover:bg-cream-raised"
          >
            Sale
          </Link>
          <a
            href="https://www.instagram.com/cotonel.lb"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg px-2 py-2.5 text-sm text-ink-soft transition hover:bg-cream-raised hover:text-ink"
          >
            Instagram
          </a>
        </nav>
      )}
    </header>
  );
}
