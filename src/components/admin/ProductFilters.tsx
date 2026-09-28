"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  q: string;
  category: string;
  gender: string;
  view: string; // "" (active) or "archived"
  categories: { slug: string; label: string; count: number }[];
  total: number; // products matching the search + gender before the category filter
  shown: number;
}

const GENDERS = [
  { value: "", label: "All genders" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
  { value: "notset", label: "Not set" },
];

// Search box + category chips + gender filter. Everything lives in the URL (?q=&category=&gender=)
// so the list is rendered on the server and the filters survive a refresh or a shared link.
export default function ProductFilters({ q, category, gender, view, categories, total, shown }: Props) {
  const router = useRouter();
  const [text, setText] = useState(q);
  const first = useRef(true);

  function go(next: { q?: string; category?: string; gender?: string }) {
    const params = new URLSearchParams();
    if (view) params.set("view", view);
    const nq = (next.q ?? text).trim();
    const nc = next.category ?? category;
    const ng = next.gender ?? gender;
    if (nq) params.set("q", nq);
    if (nc) params.set("category", nc);
    if (ng) params.set("gender", ng);
    const qs = params.toString();
    router.replace(qs ? `/admin?${qs}` : "/admin", { scroll: false });
  }

  // Search as you type (after a short pause), without reloading the page.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => go({ q: text }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const active = Boolean(q || category || gender);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search products by name or description…"
          aria-label="Search products"
          className="w-full max-w-sm rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        />
        <select
          value={gender}
          onChange={(e) => go({ gender: e.target.value })}
          aria-label="Filter by gender"
          className="rounded-lg border border-line bg-cream-raised px-3 py-2 text-sm text-ink outline-none focus:border-sage"
        >
          {GENDERS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        {active && (
          <button
            type="button"
            onClick={() => {
              setText("");
              router.replace(view ? `/admin?view=${view}` : "/admin", { scroll: false });
            }}
            className="text-sm text-blush-deep hover:brightness-90"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => go({ category: "" })}
          className={`rounded-full px-3 py-1 transition ${
            category === "" ? "bg-sage-deep text-cream-raised" : "border border-line text-ink-soft hover:text-ink"
          }`}
        >
          All categories ({total})
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => go({ category: category === c.slug ? "" : c.slug })}
            className={`rounded-full px-3 py-1 transition ${
              category === c.slug ? "bg-sage-deep text-cream-raised" : "border border-line text-ink-soft hover:text-ink"
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      {active && (
        <p className="text-xs text-ink-soft">
          Showing {shown} of {total} products
        </p>
      )}
    </div>
  );
}
