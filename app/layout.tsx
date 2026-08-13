import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";

import "./globals.css";
import { site } from "@/lib/site.config";
import SmoothScroll from "@/components/layout/SmoothScroll";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* Fraunces for display: a soft serif with SOFT and WONK axes. Dialling wonk up
   slightly gives headings a hand-made wobble, which is the entire product. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Karla for everything else: a warm grotesque that doesn't fight the serif. */
const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1b1119",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "fuzzy wire flowers",
    "chenille flowers",
    "pipe cleaner bouquet",
    "handmade bouquet Philippines",
    "graduation bouquet",
    "flowers that last forever",
    site.location.city,
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* suppressHydrationWarning: the inline script below adds a `js` class to
       this element before React hydrates, which is a deliberate mismatch. */
    <html
      lang="en-PH"
      className={`${fraunces.variable} ${karla.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Marks the document as JS-capable before first paint. The scroll-reveal
          CSS only hides content when this class is present, so if JS fails or
          is blocked the page renders fully visible instead of blank.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brass focus:px-5 focus:py-2.5 focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>

        <SmoothScroll />
        <AnnouncementBar />
        <Header />

        <main id="main">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
