/* ===========================================================================
 * THE CATALOGUE
 *
 * >>> ⚠ EVERY PIECE BELOW IS A PLACEHOLDER. Replace with your real products. <<<
 *
 * The names, prices and descriptions are invented to make the site look and feel
 * finished. They are believable, but they are not yours.
 *
 * TO ADD A PHOTO:
 *   1. Put the file in  public/photos/
 *   2. Set  photo: "/photos/your-file.jpg"
 * Until you do, each piece shows a generated panel built from its own wire
 * colours — it looks deliberate, not broken, so you can launch before you shoot.
 *
 * TO ADD A PRODUCT: copy any block, change the `slug` (must be unique, lowercase,
 * hyphens only) and edit the rest. It appears in the shop automatically.
 * =========================================================================== */

import type { FlowerShapeId } from "./flowers";
import { shape } from "./flowers";
import { wrapById, ribbonById } from "./flowers";

export type OccasionId =
  | "graduation"
  | "birthday"
  | "anniversary"
  | "proposal"
  | "wedding"
  | "get-well"
  | "thank-you"
  | "mothers-day"
  | "just-because"
  | "corporate";

export const occasions: { id: OccasionId; label: string; blurb: string }[] = [
  { id: "graduation", label: "Graduation", blurb: "Match the sablay, the toga, the school colours" },
  { id: "birthday", label: "Birthday", blurb: "Something they'll still have next birthday" },
  { id: "anniversary", label: "Anniversary", blurb: "One that outlasts the year" },
  { id: "proposal", label: "Proposal", blurb: "Kept forever, quite literally" },
  { id: "wedding", label: "Wedding", blurb: "No wilting in the heat, no rush on the day" },
  { id: "get-well", label: "Get well", blurb: "Allowed where real flowers aren't" },
  { id: "thank-you", label: "Thank you", blurb: "For teachers, nurses, and people who helped" },
  { id: "mothers-day", label: "Mother's Day", blurb: "Pollen-free, and it stays" },
  { id: "just-because", label: "Just because", blurb: "The best reason there is" },
  { id: "corporate", label: "Events & giveaways", blurb: "Volume orders, identical every time" },
];

export type ProductKind = "bouquet" | "mini" | "stem";

export const productKinds: { id: ProductKind; label: string; blurb: string }[] = [
  { id: "bouquet", label: "Bouquets", blurb: "Full hand-tied arrangements, wrapped" },
  { id: "mini", label: "Mini bouquets", blurb: "Three to five stems, small and giftable" },
  { id: "stem", label: "Single stems", blurb: "One flower. Cheapest way in, and lovely on its own." },
];

export interface ProductStem {
  shape: FlowerShapeId;
  colour: string;
  qty: number;
}

export interface Product {
  slug: string;
  name: string;
  kind: ProductKind;
  /** Pesos. Made-to-order, so this is a starting price. */
  price: number;
  occasions: OccasionId[];
  stems: ProductStem[];
  wrap: string;
  ribbon: string;
  /** One or two lines for the card. */
  blurb: string;
  /** A longer paragraph for the product page. Optional. */
  story?: string;
  /** "/photos/name.jpg" — leave "" to use the generated panel. */
  photo?: string;
  featured?: boolean;
  bestseller?: boolean;
}

export const products: Product[] = [
  {
    slug: "sunday-blush",
    name: "Sunday Blush",
    kind: "bouquet",
    price: 1450,
    occasions: ["birthday", "just-because", "thank-you", "mothers-day"],
    stems: [
      { shape: "rose", colour: "blush", qty: 6 },
      { shape: "tulip", colour: "ivory", qty: 4 },
      { shape: "bud", colour: "dusty-rose", qty: 3 },
      { shape: "leaf", colour: "sage", qty: 4 },
    ],
    wrap: "ivory",
    ribbon: "cream",
    blurb: "Soft pinks and ivory, the quietest thing we make. The one to send when you don't need a reason.",
    story:
      "This started as a bouquet for someone's mother and turned into the piece we make most often. Nothing in it shouts — the blush roses are two shades apart so the whole thing reads as one colour until you look closely.",
    featured: true,
    bestseller: true,
  },
  {
    slug: "sablay-sunrise",
    name: "Sablay Sunrise",
    kind: "bouquet",
    price: 1680,
    occasions: ["graduation", "thank-you"],
    stems: [
      { shape: "sunflower", colour: "marigold", qty: 3 },
      { shape: "rose", colour: "maroon", qty: 5 },
      { shape: "daisy", colour: "sunbeam", qty: 4 },
      { shape: "leaf", colour: "forest", qty: 4 },
    ],
    wrap: "kraft",
    ribbon: "gold",
    blurb: "Maroon and gold, built for graduation photos. Tell us your school colours and we'll rebuild it in them.",
    story:
      "Made for one graduation and reordered every March since. The maroon and gold is the default, but this is the bouquet people most often ask us to recolour — green and gold, blue and white, whatever the school wears.",
    featured: true,
    bestseller: true,
  },
  {
    slug: "first-confession",
    name: "First Confession",
    kind: "bouquet",
    price: 2850,
    occasions: ["proposal", "anniversary"],
    stems: [
      { shape: "rose", colour: "ruby", qty: 12 },
      { shape: "bud", colour: "wine", qty: 5 },
      { shape: "leaf", colour: "forest", qty: 5 },
    ],
    wrap: "korean",
    ribbon: "burgundy",
    blurb: "Twelve ruby roses, wrapped tall and dark. For the question you only ask once.",
    story:
      "Twelve roses is about five hours of work, and it shows — the petals on these are shaped more deeply than on anything else we make. Wrapped in dark matte film so the red is the only colour you see.",
    featured: true,
  },
  {
    slug: "little-charmer",
    name: "The Little Charmer",
    kind: "mini",
    price: 480,
    occasions: ["just-because", "thank-you", "birthday", "get-well"],
    stems: [
      { shape: "rose", colour: "bubblegum", qty: 2 },
      { shape: "daisy", colour: "ivory", qty: 2 },
      { shape: "leaf", colour: "sage", qty: 2 },
    ],
    wrap: "kraft",
    ribbon: "twine",
    blurb: "Three blooms and a bit of green, tied with twine. The piece the shop is named after.",
    story:
      "The first thing we ever made, and still the one we'd recommend if you've never ordered from us. Small enough to sit on a desk, cheap enough to send for no reason at all.",
    bestseller: true,
  },
  {
    slug: "one-good-rose",
    name: "One Good Rose",
    kind: "stem",
    price: 160,
    occasions: ["just-because", "anniversary", "thank-you", "corporate"],
    stems: [{ shape: "rose", colour: "ruby", qty: 1 }],
    wrap: "none",
    ribbon: "twine",
    blurb: "A single rose, any colour you like. Twenty-five minutes of work in one stem.",
    story:
      "Order one, or order sixty — this is what we make for weddings and company events when everyone needs to get something. Available in every wire colour we stock.",
  },
  {
    slug: "merienda-daisies",
    name: "Merienda Daisies",
    kind: "bouquet",
    price: 1180,
    occasions: ["birthday", "get-well", "just-because", "thank-you"],
    stems: [
      { shape: "daisy", colour: "ivory", qty: 7 },
      { shape: "daisy", colour: "sunbeam", qty: 4 },
      { shape: "bud", colour: "peach", qty: 3 },
      { shape: "leaf", colour: "mint", qty: 4 },
    ],
    wrap: "ivory",
    ribbon: "sage",
    blurb: "Eleven daisies and nothing complicated. Impossible to be in a bad mood around.",
  },
  {
    slug: "lolas-garden",
    name: "Lola's Garden",
    kind: "bouquet",
    price: 1650,
    occasions: ["mothers-day", "birthday", "thank-you", "anniversary"],
    stems: [
      { shape: "rose", colour: "dusty-rose", qty: 5 },
      { shape: "lily", colour: "cream", qty: 3 },
      { shape: "bud", colour: "taupe", qty: 4 },
      { shape: "leaf", colour: "sage", qty: 5 },
    ],
    wrap: "kraft",
    ribbon: "sage",
    blurb: "Dusty rose, cream and sage — faded on purpose, like something pressed in a book.",
    story:
      "We keep the colours deliberately muted here. It's the bouquet that suits an older house, and the one people buy for grandmothers.",
  },
  {
    slug: "cobalt-letter",
    name: "Cobalt Letter",
    kind: "bouquet",
    price: 1520,
    occasions: ["birthday", "thank-you", "just-because", "corporate"],
    stems: [
      { shape: "rose", colour: "cobalt", qty: 5 },
      { shape: "tulip", colour: "ivory", qty: 5 },
      { shape: "bud", colour: "powder", qty: 3 },
      { shape: "leaf", colour: "olive", qty: 3 },
    ],
    wrap: "ivory",
    ribbon: "cream",
    blurb: "Cobalt and ivory. Sharper and more modern than the pinks — the one men usually pick.",
  },
  {
    slug: "toga-day",
    name: "Toga Day",
    kind: "bouquet",
    price: 1890,
    occasions: ["graduation", "thank-you"],
    stems: [
      { shape: "rose", colour: "forest", qty: 6 },
      { shape: "sunflower", colour: "gold", qty: 2 },
      { shape: "lily", colour: "ivory", qty: 3 },
      { shape: "leaf", colour: "fern", qty: 5 },
    ],
    wrap: "korean",
    ribbon: "gold",
    blurb: "Built to be held in a hundred photos. Any two school colours, say the word.",
    story:
      "Taller than our other bouquets, because it's designed to be carried and photographed rather than put in a vase. The gold sunflowers are metallic wire, so they catch the flash.",
  },
  {
    slug: "everlasting-ivory",
    name: "Everlasting Ivory",
    kind: "bouquet",
    price: 3400,
    occasions: ["wedding", "proposal", "anniversary"],
    stems: [
      { shape: "rose", colour: "ivory", qty: 9 },
      { shape: "lily", colour: "cream", qty: 4 },
      { shape: "bud", colour: "ivory", qty: 6 },
      { shape: "leaf", colour: "sage", qty: 6 },
    ],
    wrap: "ivory",
    ribbon: "cream",
    blurb: "A bridal bouquet that won't wilt through a whole day in the heat — and stays on the shelf afterwards.",
    story:
      "Our largest piece, and the one we ask for the most notice on. Twenty-five stems in near-white, which is harder than it sounds — ivory and cream have to be balanced carefully or the whole thing looks grey. Bridesmaid minis available to match.",
    featured: true,
  },
  {
    slug: "nanay",
    name: "Nanay",
    kind: "bouquet",
    price: 1380,
    occasions: ["mothers-day", "birthday", "thank-you", "get-well"],
    stems: [
      { shape: "rose", colour: "blush", qty: 4 },
      { shape: "tulip", colour: "bubblegum", qty: 4 },
      { shape: "daisy", colour: "ivory", qty: 3 },
      { shape: "leaf", colour: "sage", qty: 4 },
    ],
    wrap: "ivory",
    ribbon: "cream",
    blurb: "Soft pinks, no pollen, no scent. Our most-ordered piece every May.",
  },
  {
    slug: "pocket-sunflower",
    name: "Pocket Sunflower",
    kind: "mini",
    price: 560,
    occasions: ["birthday", "get-well", "just-because", "thank-you"],
    stems: [
      { shape: "sunflower", colour: "marigold", qty: 3 },
      { shape: "leaf", colour: "fern", qty: 2 },
    ],
    wrap: "kraft",
    ribbon: "twine",
    blurb: "Three sunflowers, nothing else. Loud in the best way.",
  },
  {
    slug: "midnight-plum",
    name: "Midnight Plum",
    kind: "bouquet",
    price: 2180,
    occasions: ["anniversary", "birthday", "just-because"],
    stems: [
      { shape: "rose", colour: "plum", qty: 7 },
      { shape: "rose", colour: "onyx", qty: 3 },
      { shape: "bud", colour: "wine", qty: 4 },
      { shape: "leaf", colour: "olive", qty: 4 },
      { shape: "daisy", colour: "gold", qty: 2 },
    ],
    wrap: "mesh",
    ribbon: "gold",
    blurb: "Plum, black and gold. The most dramatic thing we make, and not for everyone.",
    story:
      "Someone asked for a bouquet that looked like it belonged in a dark room, and this is what came out. The black roses are the hardest thing in the catalogue to photograph and the easiest to sell in person.",
  },
  {
    slug: "get-well-slowly",
    name: "Get Well, Slowly",
    kind: "mini",
    price: 980,
    occasions: ["get-well", "thank-you", "just-because"],
    stems: [
      { shape: "tulip", colour: "mint", qty: 3 },
      { shape: "daisy", colour: "butter", qty: 3 },
      { shape: "bud", colour: "powder", qty: 2 },
      { shape: "leaf", colour: "sage", qty: 3 },
    ],
    wrap: "ivory",
    ribbon: "sage",
    blurb: "Mint and butter yellow, small enough for a bedside table. Allowed in hospitals, unlike the real thing.",
  },
];

/* --- lookups & derived data ----------------------------------------------- */

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function productBySlug(slug: string): Product | undefined {
  return bySlug.get(slug);
}

/** Every wire colour used in a piece, most-used first. Powers colour filtering
 *  and the generated placeholder panels. */
export function productColours(p: Product): string[] {
  const counts = new Map<string, number>();
  for (const s of p.stems) counts.set(s.colour, (counts.get(s.colour) ?? 0) + s.qty);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

export function stemCount(p: Product): number {
  return p.stems.reduce((n, s) => n + s.qty, 0);
}

/** What the stems and finishing would cost if built in the builder. Used to
 *  sanity-check catalogue prices — not shown to customers. */
export function componentTotal(p: Product): number {
  const stems = p.stems.reduce((sum, s) => sum + shape(s.shape).price * s.qty, 0);
  return stems + wrapById(p.wrap).price + ribbonById(p.ribbon).price;
}

export const featuredProducts = products.filter((p) => p.featured);

export function productsForOccasion(id: OccasionId): Product[] {
  return products.filter((p) => p.occasions.includes(id));
}

export const priceBands = [
  { id: "under-750", label: "Under ₱750", min: 0, max: 749 },
  { id: "750-1500", label: "₱750 – ₱1,500", min: 750, max: 1500 },
  { id: "1500-2500", label: "₱1,500 – ₱2,500", min: 1500, max: 2500 },
  { id: "over-2500", label: "Over ₱2,500", min: 2501, max: Number.MAX_SAFE_INTEGER },
] as const;

export function formatPeso(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}
