/* ===========================================================================
 * FLOWER SHAPES
 *
 * The shapes you can make, and what each costs per stem.
 * These drive the builder's first step and the 3D geometry.
 *
 * >>> DON'T EDIT THIS FILE — edit at /admin → Flower shapes. <<<
 *
 * The shapes themselves live in content/materials.json, and the admin gives
 * every geometry number a slider and a live 3D preview.
 *
 * The `geometry` block controls how the 3D flower is built. Changing those
 * numbers changes how the flower looks on screen — safe to experiment with,
 * but the defaults are tuned to look like real chenille work.
 * =========================================================================== */

import materials from "@/content/materials.json";

/**
 * A shape id. Plain string rather than a fixed union, because shapes are now
 * editable in the admin — you can add a peony or a carnation without a code
 * change. Lookups fall back to the first shape if an id goes missing.
 */
export type FlowerShapeId = string;

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
  /**
   * Greenery rather than a bloom. Foliage is arranged around the OUTSIDE of a
   * bouquet; blooms are mixed through the middle. Without this flag every new
   * leaf variant would clump into the centre.
   */
  foliage?: boolean;
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

export const flowerShapes = materials.flowerShapes as FlowerShape[];

const shapeById = new Map(flowerShapes.map((s) => [s.id, s]));

export function shape(id: FlowerShapeId): FlowerShape {
  return shapeById.get(id) ?? flowerShapes[0];
}

/* ---------------------------------------------------------------------------
 * WRAPS & RIBBONS — the finishing options in the builder's third step.
 * ------------------------------------------------------------------------- */

/** Wrapping paper. Chosen by colour rather than by type. */
export interface Wrap {
  id: string;
  name: string;
  price: number;
  hex: string;
}

export const wraps = materials.wraps as Wrap[];

export interface Ribbon {
  id: string;
  name: string;
  price: number;
  hex: string;
}

export const ribbons = materials.ribbons as Ribbon[];

export function wrapById(id: string): Wrap {
  return wraps.find((w) => w.id === id) ?? wraps[0];
}

export function ribbonById(id: string): Ribbon {
  return ribbons.find((r) => r.id === id) ?? ribbons[0];
}
