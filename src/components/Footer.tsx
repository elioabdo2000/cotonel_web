import Link from "next/link";
import { site, whatsappLink } from "@/data/site";
import TrustBar from "./TrustBar";
import Photo from "./Photo";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <TrustBar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {/* Put your logo file at /public/images/logo.png (create the
                /images folder inside /public if it isn't there yet). Until
                that file exists, this shows a soft placeholder instead of
                a broken image. object-contain keeps the whole logo visible
                without cropping it, whatever its shape. */}
            <Photo
              src="/images/logo.png"
              alt={`${site.name} logo`}
              accent="sage"
              className="h-12 w-12 flex-shrink-0 object-contain"
            />
            <div>
              <p className="font-display text-xl italic text-ink">Cotonel.lb</p>
              <p className="text-sm text-ink-soft">by Samar</p>
              <p className="mt-2 max-w-xs text-sm text-ink-soft">
                {site.tagline} — {site.city}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-ink-soft">
            <a
              href={whatsappLink("something from " + site.name)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-ink"
            >
              <WhatsAppIcon />
              Message on WhatsApp
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition hover:text-ink"
            >
              <InstagramIcon />
              @cotonel.lb on Instagram
            </a>
            <Link href="/faq" className="transition hover:text-ink">
              Delivery, payment &amp; returns (FAQ)
            </Link>
          </div>
        </div>

        <p className="mt-10 text-xs text-ink-faint">
          © {new Date().getFullYear()} {site.name}. 100% pure cotton.
        </p>
      </div>
    </footer>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.6-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94s.72-2.09.98-2.37c.24-.27.53-.34.71-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.81 2.01.88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.38-.24.63-.14.26.1 1.63.77 1.91.91.29.14.48.21.55.33.07.12.07.68-.17 1.35Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
