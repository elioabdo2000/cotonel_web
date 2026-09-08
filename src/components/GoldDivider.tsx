// A thin brass-toned divider with a centered diamond mark — the small
// flourish luxury boutique sites use between sections instead of a plain
// line, without adding any real visual weight or slowing the page down.
export default function GoldDivider() {
  return (
    <div className="mx-auto flex max-w-xs items-center gap-3 px-6 py-2" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--color-gold-soft)]" />
      <span className="text-[10px] text-[var(--color-gold)]">◆</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--color-gold-soft)]" />
    </div>
  );
}
