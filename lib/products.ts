/* ===========================================================================
 * THE CATALOGUE
 *
 * >>> DON'T EDIT THIS FILE — edit the products instead. <<<
 *
 * Sign in at  /admin  →  Products  to add, edit, reorder and photograph your
 * pieces. Everything is stored in  content/products.json , which you can also
 * edit by hand if you'd rather.
 *
 * This file only reads that JSON and provides the lookups the site needs.
 *
 * Pieces without a photo draw their own bouquet from their stem list, so the
 * shop looks finished before you've shot anything.
 * =========================================================================== */

import catalogue from "@/content/products.json";
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

/**
 * The catalogue, read from content/products.json.
 *
 * Cast rather than validated here because the admin route validates on the way
 * in — anything that reaches this file has already been checked.
 */
export const products = catalogue.products as Product[];

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
