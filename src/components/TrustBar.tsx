import { site } from "@/data/site";

const POINTS = [
  { icon: "✦", label: "100% Pure Cotton" },
  { icon: "✎", label: "Order Directly on WhatsApp" },
  { icon: "◈", label: `Based in ${site.city}` },
];

// A slim, understated row of reassurances just under the carousel — the
// kind of small-print confidence signal boutique sites use instead of a
// loud banner. Wraps cleanly on narrow phones instead of overflowing.
export default function TrustBar() {
  return (
    <div className="border-b border-line bg-cream-raised/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4 text-center">
        {POINTS.map((point) => (
          <p
            key={point.label}
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft sm:text-xs"
          >
            <span className="text-sage-deep">{point.icon}</span>
            {point.label}
          </p>
        ))}
      </div>
    </div>
  );
}
