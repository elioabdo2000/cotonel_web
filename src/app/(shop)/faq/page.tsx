import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";

export default function FaqPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link href="/" className="text-sm text-ink-soft transition hover:text-ink">
          ← Back to home
        </Link>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-[var(--color-gold)] sm:text-xs">
          Good to know
        </p>
        <h1 className="font-display mt-2 text-center text-3xl italic text-ink sm:text-4xl">
          Frequently Asked Questions
        </h1>

        <div className="mt-10">
          <FaqAccordion />
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          Still have a question? Message us directly on WhatsApp — the button is in the corner of
          every page.
        </p>
      </div>
    </div>
  );
}
