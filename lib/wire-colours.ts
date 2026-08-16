/* ===========================================================================
 * WIRE COLOURS — your chenille stock.
 *
 * >>> DON'T EDIT THIS FILE — edit at /admin → Wire colours. <<<
 *
 * The stock itself lives in content/materials.json.
 *
 * These swatches drive the bouquet builder's colour picker, the gallery colour
 * filter and the colour matcher. Getting them close to your real wire matters
 * more than getting them pretty — a customer who picks "Ruby" here and receives
 * something else will notice.
 *
 * Easiest way to do this properly: photograph your wire stock in daylight, open
 * the photo in any image editor, and use the eyedropper on each colour.
 * =========================================================================== */

import materials from "@/content/materials.json";

export interface WireColour {
  id: string;
  name: string;
  hex: string;
  /** Set false when you run out. It stays visible but is marked unavailable,
   *  which answers the question before anyone has to ask it. */
  inStock?: boolean;
}

export const wireColours = materials.wireColours as WireColour[];

/* --- lookups --------------------------------------------------------------- */

const byId = new Map(wireColours.map((c) => [c.id, c]));

export function wire(id: string): WireColour {
  return byId.get(id) ?? wireColours[0];
}

export function wireHex(id: string): string {
  return wire(id).hex;
}

export function isInStock(c: WireColour): boolean {
  return c.inStock !== false;
}

/* --- colour matching ------------------------------------------------------
 * Used by the colour matcher: "here's the shade I need, what do you have?"
 * Compared in OKLab rather than RGB, because RGB distance ranks colours in a
 * way that looks obviously wrong to a human eye — two greens can be "closer"
 * to each other numerically than a pink is to a near-identical pink.
 * ------------------------------------------------------------------------- */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** sRGB (0-255) → OKLab. */
function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);

  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabDistance(a: string, b: string): number {
  const [l1, a1, b1] = rgbToOklab(...hexToRgb(a));
  const [l2, a2, b2] = rgbToOklab(...hexToRgb(b));
  // Lightness is weighted a little lower: a customer matching a colour cares
  // more about hue being right than about it being a shade lighter.
  return Math.sqrt(0.8 * (l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

export interface WireMatch {
  colour: WireColour;
  /** 0–100, where 100 is identical. */
  closeness: number;
}

/** The `count` wires closest to an arbitrary hex value, best first. */
export function nearestWires(hex: string, count = 4): WireMatch[] {
  return wireColours
    .map((colour) => {
      const d = oklabDistance(hex, colour.hex);
      // 0.36 in OKLab is roughly "unmistakably a different colour".
      const closeness = Math.max(0, Math.round((1 - Math.min(d / 0.36, 1)) * 100));
      return { colour, closeness };
    })
    .sort((x, y) => y.closeness - x.closeness)
    .slice(0, count);
}

/** A lighter tint of a wire, used for the fibre sheen in the 3D material. */
export function tint(hex: string, amount = 0.4): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  );
}

/** Is this colour light enough that dark text should sit on it? */
export function isLight(hex: string): boolean {
  const [l] = rgbToOklab(...hexToRgb(hex));
  return l > 0.72;
}
