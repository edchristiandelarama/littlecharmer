/* ===========================================================================
 * FLOWER SHAPES
 *
 * The shapes you can make, and what each costs per stem.
 * These drive the builder's first step and the 3D geometry.
 *
 * >>> EDIT the names, prices and blurbs to match what you offer. <<<
 *
 * The `geometry` block controls how the 3D flower is built. Changing those
 * numbers changes how the flower looks on screen — safe to experiment with,
 * but the defaults are tuned to look like real chenille work.
 * =========================================================================== */

export type FlowerShapeId =
  | "rose"
  | "tulip"
  | "daisy"
  | "sunflower"
  | "lily"
  | "bud"
  | "leaf";

export interface FlowerShape {
  id: FlowerShapeId;
  name: string;
  /** One line, shown in the picker. */
  blurb: string;
  /** Pesos per stem. */
  price: number;
  /** How long one takes you — shown as a nice honest detail. */
  effort: string;
  /** A sensible starting colour when this shape is first added. */
  defaultColour: string;
  geometry: {
    /** Number of petal loops. */
    petals: number;
    /** How many rows the petals are arranged in (1 = flat, 3 = full rose). */
    layers: number;
    /** Petal loop length. */
    petalLength: number;
    /** Petal loop width. */
    petalWidth: number;
    /** Wire thickness. */
    wireRadius: number;
    /** Degrees each petal tilts away from vertical. 0 = closed, 90 = flat open. */
    openness: number;
    /** Rotation offset between layers, degrees. */
    layerTwist: number;
    /** Visible centre disc (sunflowers, daisies). */
    centre: number;
    centreColour?: string;
    /** Stem length. */
    stemLength: number;
  };
}

export const flowerShapes: FlowerShape[] = [
  {
    id: "rose",
    name: "Rose",
    blurb: "Fifteen petals, spiralled tight. The one everyone asks for.",
    price: 120,
    effort: "about 25 minutes each",
    defaultColour: "ruby",
    geometry: {
      petals: 15,
      layers: 3,
      petalLength: 0.5,
      petalWidth: 0.32,
      wireRadius: 0.033,
      // Outer petals fall well open, inner ones stay cupped — the geometry
      // builder tightens each layer inward from this figure.
      openness: 52,
      layerTwist: 26,
      centre: 0.06,
      stemLength: 2.5,
    },
  },
  {
    id: "tulip",
    name: "Tulip",
    blurb: "Six upright petals, cupped closed. Clean and modern.",
    price: 100,
    effort: "about 15 minutes each",
    defaultColour: "blush",
    geometry: {
      petals: 6,
      layers: 2,
      petalLength: 0.54,
      petalWidth: 0.28,
      wireRadius: 0.036,
      openness: 16,
      layerTwist: 30,
      centre: 0.05,
      stemLength: 2.6,
    },
  },
  {
    id: "daisy",
    name: "Daisy",
    blurb: "Twelve slim petals around a bright centre. Cheerful, quick.",
    price: 70,
    effort: "about 10 minutes each",
    defaultColour: "ivory",
    geometry: {
      petals: 12,
      layers: 1,
      petalLength: 0.46,
      petalWidth: 0.15,
      wireRadius: 0.03,
      openness: 74,
      layerTwist: 0,
      centre: 0.17,
      centreColour: "sunbeam",
      stemLength: 2.35,
    },
  },
  {
    id: "sunflower",
    name: "Sunflower",
    blurb: "Eighteen petals and a dark seeded middle. The showpiece.",
    price: 140,
    effort: "about 30 minutes each",
    defaultColour: "marigold",
    geometry: {
      petals: 18,
      layers: 2,
      petalLength: 0.52,
      petalWidth: 0.16,
      wireRadius: 0.03,
      openness: 70,
      layerTwist: 10,
      centre: 0.27,
      centreColour: "onyx",
      stemLength: 2.65,
    },
  },
  {
    id: "lily",
    name: "Lily",
    blurb: "Five pointed petals, swept back. The elegant one.",
    price: 130,
    effort: "about 20 minutes each",
    defaultColour: "ivory",
    geometry: {
      petals: 5,
      layers: 1,
      petalLength: 0.62,
      petalWidth: 0.19,
      wireRadius: 0.031,
      openness: 62,
      layerTwist: 0,
      centre: 0.08,
      centreColour: "marigold",
      stemLength: 2.55,
    },
  },
  {
    id: "bud",
    name: "Bud",
    blurb: "A small closed bloom. Good for filling gaps between the big ones.",
    price: 55,
    effort: "about 8 minutes each",
    defaultColour: "dusty-rose",
    geometry: {
      petals: 5,
      layers: 1,
      petalLength: 0.3,
      petalWidth: 0.19,
      wireRadius: 0.032,
      openness: 8,
      layerTwist: 0,
      centre: 0.03,
      stemLength: 2.1,
    },
  },
  {
    id: "leaf",
    name: "Leaf",
    blurb: "Foliage. Not a flower, but a bouquet looks unfinished without it.",
    price: 45,
    effort: "about 5 minutes each",
    defaultColour: "fern",
    geometry: {
      petals: 3,
      layers: 1,
      petalLength: 0.62,
      petalWidth: 0.19,
      wireRadius: 0.028,
      // Angled up, not out. At 80°+ the blades stick out of a bouquet like
      // antennae instead of filling the gaps between blooms.
      openness: 48,
      layerTwist: 0,
      centre: 0,
      stemLength: 2.2,
    },
  },
];

const shapeById = new Map(flowerShapes.map((s) => [s.id, s]));

export function shape(id: FlowerShapeId): FlowerShape {
  return shapeById.get(id) ?? flowerShapes[0];
}

/* ---------------------------------------------------------------------------
 * WRAPS & RIBBONS — the finishing options in the builder's third step.
 * ------------------------------------------------------------------------- */

export interface Wrap {
  id: string;
  name: string;
  blurb: string;
  price: number;
  /** Paper colour, for the 3D preview. */
  hex: string;
}

export const wraps: Wrap[] = [
  { id: "kraft", name: "Kraft paper", blurb: "Plain brown, folded double. Understated.", price: 80, hex: "#b08a5e" },
  { id: "ivory", name: "Ivory tissue", blurb: "Soft, layered, slightly translucent.", price: 100, hex: "#efe6d6" },
  { id: "korean", name: "Korean wrap", blurb: "Matte film in a deep tone, the tall wrapped look.", price: 140, hex: "#3a2b3b" },
  { id: "mesh", name: "Plum mesh", blurb: "Open weave over paper. Catches the light.", price: 150, hex: "#6b3a5e" },
  { id: "none", name: "No wrap", blurb: "Stems tied bare with twine.", price: 0, hex: "#7a6a79" },
];

export interface Ribbon {
  id: string;
  name: string;
  price: number;
  hex: string;
}

export const ribbons: Ribbon[] = [
  { id: "gold", name: "Gold satin", price: 40, hex: "#c9a227" },
  { id: "cream", name: "Cream satin", price: 35, hex: "#ebe1cc" },
  { id: "burgundy", name: "Burgundy velvet", price: 50, hex: "#7d2338" },
  { id: "sage", name: "Sage linen", price: 40, hex: "#9cb39a" },
  { id: "twine", name: "Bare twine", price: 15, hex: "#a99a8c" },
];

export function wrapById(id: string): Wrap {
  return wraps.find((w) => w.id === id) ?? wraps[0];
}

export function ribbonById(id: string): Ribbon {
  return ribbons.find((r) => r.id === id) ?? ribbons[0];
}
