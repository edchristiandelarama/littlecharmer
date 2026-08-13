import { z } from "zod";

/* ===========================================================================
 * The shape of content/site.json.
 *
 * Checked on the way in from the admin panel. A malformed save would break the
 * next build and take the whole site down until someone repaired the JSON by
 * hand, so it's worth refusing bad data at the door.
 * =========================================================================== */

const text = (max = 400) => z.string().trim().max(max);
const required = (label: string, max = 400) =>
  z.string().trim().min(1, `${label} can't be empty`).max(max);

export const contentSchema = z.object({
  _comment: z.string().optional(),

  shop: z.object({
    name: required("Shop name", 60),
    tagline: required("Tagline", 120),
    description: required("Description", 400),
    city: required("City", 80),
    region: required("Region", 80),
    country: required("Country", 80),
  }),

  contact: z.object({
    email: z.string().trim().email("That doesn't look like an email address"),
    phone: text(30),
    phoneDisplay: text(30),
    facebookPage: required("Facebook page", 80),
    instagram: text(80),
    tiktok: text(80),
    viberEnabled: z.boolean(),
    replyWindow: text(160),
    hours: z
      .array(z.object({ days: text(80), time: text(80) }))
      .max(7),
  }),

  announcements: z
    .array(z.object({ text: text(160), href: text(200) }))
    .max(8),

  promo: z.object({
    active: z.boolean(),
    kicker: text(60),
    headline: text(160),
    body: text(400),
    ctaLabel: text(40),
    ctaHref: text(200),
  }),

  gradSeason: z.object({
    active: z.boolean(),
    startMonth: z.number().int().min(1).max(12),
    endMonth: z.number().int().min(1).max(12),
    headline: text(80),
    body: text(400),
  }),

  fulfilment: z.object({
    leadTimeNote: text(600),
    depositNote: text(400),
    payments: z.array(text(60)).max(10),
    zones: z
      .array(z.object({ name: text(80), detail: text(200), cost: text(80) }))
      .max(8),
  }),

  about: z.object({
    kicker: text(60),
    headline: required("About headline", 120),
    photo: text(200),
    photoCaption: text(160),
    body: z.array(text(1200)).max(8),
  }),

  craftSteps: z
    .array(z.object({ step: text(80), body: text(800), detail: text(120) }))
    .max(8),

  promises: z
    .array(
      z.object({
        title: text(80),
        body: text(600),
        stat: text(20),
        statUnit: text(60),
      }),
    )
    .max(6),

  faqs: z
    .array(z.object({ q: required("Question", 200), a: text(1600) }))
    .max(30),

  reviews: z
    .array(
      z.object({
        name: text(60),
        where: text(60),
        occasion: text(40),
        stars: z.number().int().min(1).max(5),
        text: text(800),
      }),
    )
    .max(40),
});

export type SiteContent = z.infer<typeof contentSchema>;
