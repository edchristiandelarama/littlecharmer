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

/* ---------------------------------------------------------------------------
 * THE CATALOGUE — content/products.json
 * ------------------------------------------------------------------------- */

const SHAPES = ["rose", "tulip", "daisy", "sunflower", "lily", "bud", "leaf"] as const;
const KINDS = ["bouquet", "mini", "stem"] as const;
const OCCASIONS = [
  "graduation",
  "birthday",
  "anniversary",
  "proposal",
  "wedding",
  "get-well",
  "thank-you",
  "mothers-day",
  "just-because",
  "corporate",
] as const;

export const productsSchema = z.object({
  _comment: z.string().optional(),
  products: z
    .array(
      z.object({
        /* The slug is the piece's web address, so it has to be URL-safe and
           unique. Changing it breaks any link already shared. */
        slug: z
          .string()
          .trim()
          .min(1, "Each piece needs a web address")
          .max(80)
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Use lowercase letters, numbers and hyphens only",
          ),
        name: required("Product name", 80),
        kind: z.enum(KINDS),
        price: z.number().int().min(0).max(1_000_000),
        occasions: z.array(z.enum(OCCASIONS)).max(10),
        stems: z
          .array(
            z.object({
              shape: z.enum(SHAPES),
              colour: z.string().trim().min(1).max(40),
              qty: z.number().int().min(1).max(60),
            }),
          )
          .max(12),
        wrap: z.string().trim().max(40),
        ribbon: z.string().trim().max(40),
        blurb: text(400),
        story: text(1600).optional(),
        photo: text(300).optional(),
        featured: z.boolean().optional(),
        bestseller: z.boolean().optional(),
      }),
    )
    .max(80)
    .superRefine((list, ctx) => {
      const seen = new Set<string>();
      list.forEach((p, i) => {
        if (seen.has(p.slug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [i, "slug"],
            message: `"${p.slug}" is used twice — each piece needs its own web address`,
          });
        }
        seen.add(p.slug);
      });
    }),
});

export type ProductsContent = z.infer<typeof productsSchema>;

/* ---------------------------------------------------------------------------
 * MATERIALS — content/materials.json
 *
 * Your wire stock, the shapes you make, and the wraps and ribbons. These drive
 * the builder, the colour matcher, the shop filters and the 3D geometry.
 * ------------------------------------------------------------------------- */

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const hex = (label: string) =>
  z.string().trim().regex(HEX, `${label} must be a colour like #c8102e`);

const slug = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is needed`)
    .max(40)
    .regex(ID, `${label} must be lowercase letters, numbers and hyphens`);

/** Fails when a list contains the same id twice. Ids are how everything else
 *  refers to these, so a duplicate silently shadows one of them. */
function uniqueIds<T extends { id: string }>(what: string) {
  return (list: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, "id"],
          message: `Two ${what} share the id "${item.id}"`,
        });
      }
      seen.add(item.id);
    });
  };
}

export const materialsSchema = z.object({
  _comment: z.string().optional(),

  wireColours: z
    .array(
      z.object({
        id: slug("Colour id"),
        name: required("Colour name", 40),
        hex: hex("Colour"),
        family: z.enum(["pink", "warm", "green", "cool", "neutral"]),
        metallic: z.boolean().optional(),
        inStock: z.boolean().optional(),
      }),
    )
    .min(1, "You need at least one wire colour")
    .max(120)
    .superRefine(uniqueIds("colours")),

  flowerShapes: z
    .array(
      z.object({
        id: slug("Shape id"),
        name: required("Shape name", 40),
        blurb: text(200),
        price: z.number().int().min(0).max(100_000),
        effort: text(80),
        defaultColour: z.string().trim().max(40),
        geometry: z.object({
          petals: z.number().int().min(1).max(48),
          layers: z.number().int().min(1).max(6),
          petalLength: z.number().min(0.05).max(2),
          petalWidth: z.number().min(0.02).max(1),
          wireRadius: z.number().min(0.005).max(0.15),
          openness: z.number().min(0).max(90),
          layerTwist: z.number().min(0).max(180),
          centre: z.number().min(0).max(1),
          centreColour: z.string().trim().max(40).optional(),
          stemLength: z.number().min(0.5).max(6),
        }),
      }),
    )
    .min(1, "You need at least one flower shape")
    .max(40)
    .superRefine(uniqueIds("shapes")),

  wraps: z
    .array(
      z.object({
        id: slug("Wrap id"),
        name: required("Wrap name", 40),
        blurb: text(200),
        price: z.number().int().min(0).max(100_000),
        hex: hex("Wrap colour"),
      }),
    )
    .min(1)
    .max(20)
    .superRefine(uniqueIds("wraps")),

  ribbons: z
    .array(
      z.object({
        id: slug("Ribbon id"),
        name: required("Ribbon name", 40),
        price: z.number().int().min(0).max(100_000),
        hex: hex("Ribbon colour"),
      }),
    )
    .min(1)
    .max(20)
    .superRefine(uniqueIds("ribbons")),
});

export type MaterialsContent = z.infer<typeof materialsSchema>;
