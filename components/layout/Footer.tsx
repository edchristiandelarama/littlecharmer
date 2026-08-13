import Link from "next/link";
import Logo from "@/components/brand/Logo";
import {
  contact,
  facebookUrl,
  fulfilment,
  instagramUrl,
  messengerUrl,
  site,
  tiktokUrl,
  viberUrl,
} from "@/lib/site.config";

const shopLinks = [
  { label: "All pieces", href: "/shop" },
  { label: "Bouquets", href: "/shop?kind=bouquet" },
  { label: "Mini bouquets", href: "/shop?kind=mini" },
  { label: "Single stems", href: "/shop?kind=stem" },
  { label: "Build your own", href: "/build" },
];

const helpLinks = [
  { label: "Start an order", href: "/order" },
  { label: "Bulk & events", href: "/custom" },
  { label: "Questions", href: "/faq" },
  { label: "How we make it", href: "/#process" },
  { label: "About us", href: "/#about" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { label: "Facebook", href: facebookUrl },
    { label: "Messenger", href: messengerUrl },
    contact.instagram ? { label: "Instagram", href: instagramUrl } : null,
    contact.tiktok ? { label: "TikTok", href: tiktokUrl } : null,
    contact.viberEnabled ? { label: "Viber", href: viberUrl } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="border-t border-line bg-void">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8 lg:py-20">
        {/* identity */}
        <div className="flex flex-col gap-5">
          <Logo variant="stacked" tagline className="items-start text-[0.85rem]" />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Handmade fuzzy wire flowers, made to order in {site.location.city} and
            shipped anywhere in the {site.location.country}.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-cream-2 underline decoration-line-firm underline-offset-4 transition-colors hover:text-brass hover:decoration-brass"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* shop */}
        <nav aria-labelledby="footer-shop" className="flex flex-col gap-3.5">
          <h2 id="footer-shop" className="eyebrow">
            Shop
          </h2>
          <ul className="flex flex-col gap-2.5">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-cream-2 transition-colors hover:text-brass"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* help */}
        <nav aria-labelledby="footer-help" className="flex flex-col gap-3.5">
          <h2 id="footer-help" className="eyebrow">
            Orders
          </h2>
          <ul className="flex flex-col gap-2.5">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-cream-2 transition-colors hover:text-brass"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* contact strip */}
      <div className="border-t border-line/60">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="eyebrow">Message us</h3>
            <a
              href={`mailto:${contact.email}`}
              className="text-sm text-cream transition-colors hover:text-brass"
            >
              {contact.email}
            </a>
            <a
              href={`tel:${contact.phone}`}
              className="text-sm text-cream transition-colors hover:text-brass"
            >
              {contact.phoneDisplay}
            </a>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="eyebrow">When we reply</h3>
            {contact.hours.map((h) => (
              <p key={h.days} className="text-sm text-muted">
                <span className="text-cream-2">{h.days}</span>
                <br />
                {h.time}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="eyebrow">Where we are</h3>
            <p className="text-sm text-muted">
              {site.location.city}
              <br />
              {site.location.region}, {site.location.country}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="eyebrow">Payment</h3>
            <p className="text-sm text-muted">{fulfilment.payments.join(" · ")}</p>
          </div>
        </div>
      </div>

      {/* legal */}
      <div className="border-t border-line/60">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>
            © {year} {site.name}. Every piece made by hand.
          </p>
          <p>
            Flowers that never wilt — {site.location.city}, {site.location.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
