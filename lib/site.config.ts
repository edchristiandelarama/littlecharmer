/* ===========================================================================
 * LITTLE CHARMER — SHOP SETTINGS
 *
 * >>> DON'T EDIT THIS FILE. Edit the content instead. <<<
 *
 * Two ways to change what the site says:
 *
 *   1. Sign in at  /admin  and edit it in a form. Saving commits the change to
 *      GitHub, which redeploys the site automatically. This is the normal way.
 *   2. Edit  content/site.json  by hand, if you'd rather.
 *
 * This file only reads that JSON and hands it to the rest of the site in the
 * shape the components expect. The one thing that genuinely lives here is
 * `site.url`, because it comes from an environment variable rather than the
 * content file.
 * =========================================================================== */

import content from "@/content/site.json";

/* --- types the rest of the site relies on --------------------------------- */

export interface Hours {
  days: string;
  time: string;
}
export interface Announcement {
  text: string;
  href?: string;
}
export interface Zone {
  name: string;
  detail: string;
  cost: string;
}
export interface CraftStep {
  step: string;
  body: string;
  detail: string;
}
export interface Promise_ {
  title: string;
  body: string;
  stat: string;
  statUnit: string;
}
export interface Faq {
  q: string;
  a: string;
}
export interface Review {
  name: string;
  where: string;
  occasion: string;
  stars: number;
  text: string;
}

/* --- shop identity -------------------------------------------------------- */

export const site = {
  name: content.shop.name,
  tagline: content.shop.tagline,
  description: content.shop.description,

  /** Set NEXT_PUBLIC_SITE_URL once you have a domain. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  location: {
    city: content.shop.city,
    region: content.shop.region,
    country: content.shop.country,
  },

  currency: {
    code: "PHP",
    symbol: "₱",
    locale: "en-PH",
  },
};

/* --- contact -------------------------------------------------------------- */

export const contact = {
  email: content.contact.email,
  phone: content.contact.phone,
  phoneDisplay: content.contact.phoneDisplay,
  /** The bit after facebook.com/. Powers every Messenger button, so it has to
   *  be exact or those buttons open a dead page. */
  facebookPage: content.contact.facebookPage,
  instagram: content.contact.instagram,
  tiktok: content.contact.tiktok,
  viberEnabled: content.contact.viberEnabled,
  replyWindow: content.contact.replyWindow,
  hours: content.contact.hours as Hours[],
};

export const messengerUrl = `https://m.me/${contact.facebookPage}`;
export const facebookUrl = `https://facebook.com/${contact.facebookPage}`;
export const instagramUrl = `https://instagram.com/${contact.instagram}`;
export const tiktokUrl = `https://tiktok.com/@${contact.tiktok}`;
export const viberUrl = `viber://chat?number=${encodeURIComponent(contact.phone)}`;

/* --- banners -------------------------------------------------------------- */

/** Lines with no text are dropped, so a blank row in the admin just disappears. */
export const announcements: Announcement[] = content.announcements
  .filter((a) => a.text.trim().length > 0)
  .map((a) => ({ text: a.text, href: a.href || undefined }));

export const promo = {
  ...content.promo,
  until: "",
};

export const gradSeason = content.gradSeason;

/* --- fulfilment ----------------------------------------------------------- */

export const fulfilment = {
  leadTimeNote: content.fulfilment.leadTimeNote,
  depositNote: content.fulfilment.depositNote,
  payments: content.fulfilment.payments,
  zones: content.fulfilment.zones as Zone[],
};

/* --- page content --------------------------------------------------------- */

export const about = content.about;
export const craftSteps = content.craftSteps as CraftStep[];
export const promises = content.promises as Promise_[];
export const faqs = content.faqs as Faq[];
export const reviews = content.reviews as Review[];
