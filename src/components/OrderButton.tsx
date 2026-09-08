import { whatsappLink } from "@/data/site";

function WhatsAppGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.72-2.09.98-2.37c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.81 2.01.88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.29.14.48.21.55.33.07.12.07.68-.17 1.35Z" />
    </svg>
  );
}

export default function OrderButton({
  productName,
  full = false,
}: {
  productName: string;
  full?: boolean;
}) {
  return (
    <a
      href={whatsappLink(productName)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-whatsapp)] px-3.5 py-2 text-xs font-medium text-cream-raised transition hover:brightness-110 ${
        full ? "w-full" : ""
      }`}
    >
      <WhatsAppGlyph />
      Order on WhatsApp
    </a>
  );
}
