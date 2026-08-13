/* ===========================================================================
 * BOUQUET ↔ URL
 *
 * The whole build is packed into a single URL parameter, so a customer can
 * share what they designed with whoever is paying, and so the order form can
 * read the design back without any server storage.
 *
 * String ids are used rather than array indices on purpose: adding or
 * reordering a flower shape in flowers.ts would silently change every existing
 * shared link if we encoded positions.
 * =========================================================================== */

import type { FlowerShapeId } from "./flowers";
import { flowerShapes, ribbons, shape, wraps, wrapById, ribbonById } from "./flowers";
import { wire, wireColours } from "./wire-colours";

export interface BuildStem {
  shape: FlowerShapeId;
  colour: string;
  qty: number;
}

export interface BouquetBuild {
  stems: BuildStem[];
  wrap: string;
  ribbon: string;
  name?: string;
}

export const MAX_STEMS = 36;
export const MAX_STEM_GROUPS = 10;

export const emptyBuild: BouquetBuild = {
  stems: [],
  wrap: "kraft",
  ribbon: "gold",
};

/** A pleasant starting point so the builder is never an empty vase. */
export const starterBuild: BouquetBuild = {
  stems: [
    { shape: "rose", colour: "blush", qty: 5 },
    { shape: "tulip", colour: "ivory", qty: 3 },
    { shape: "leaf", colour: "sage", qty: 3 },
  ],
  wrap: "kraft",
  ribbon: "gold",
};

/* --- pricing --------------------------------------------------------------- */

export function buildStemCount(b: BouquetBuild): number {
  return b.stems.reduce((n, s) => n + s.qty, 0);
}

export function buildTotal(b: BouquetBuild): number {
  const stems = b.stems.reduce((sum, s) => sum + shape(s.shape).price * s.qty, 0);
  return stems + wrapById(b.wrap).price + ribbonById(b.ribbon).price;
}

/* --- encoding -------------------------------------------------------------- */

interface Packed {
  s: [string, string, number][];
  w: string;
  r: string;
  n?: string;
}

function toBase64Url(s: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(s, "utf8").toString("base64")
      : btoa(unescape(encodeURIComponent(s)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return typeof window === "undefined"
    ? Buffer.from(padded, "base64").toString("utf8")
    : decodeURIComponent(escape(atob(padded)));
}

export function encodeBuild(b: BouquetBuild): string {
  const packed: Packed = {
    s: b.stems.map((s) => [s.shape, s.colour, s.qty]),
    w: b.wrap,
    r: b.ribbon,
  };
  if (b.name?.trim()) packed.n = b.name.trim().slice(0, 60);
  try {
    return toBase64Url(JSON.stringify(packed));
  } catch {
    return "";
  }
}

/**
 * Decode a shared build. Returns null for anything malformed rather than
 * throwing — a mangled link should show an empty builder, never a crash.
 * Unknown shapes/colours are dropped (they may have been removed from the
 * catalogue since the link was made).
 */
export function decodeBuild(encoded: string | null | undefined): BouquetBuild | null {
  if (!encoded) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(encoded));
  } catch {
    return null;
  }

  if (typeof raw !== "object" || raw === null) return null;
  const p = raw as Partial<Packed>;
  if (!Array.isArray(p.s)) return null;

  const validShapes = new Set(flowerShapes.map((f) => f.id));
  const validColours = new Set(wireColours.map((c) => c.id));

  const stems: BuildStem[] = [];
  for (const entry of p.s.slice(0, MAX_STEM_GROUPS)) {
    if (!Array.isArray(entry) || entry.length < 3) continue;
    const [shapeId, colourId, qty] = entry;
    if (typeof shapeId !== "string" || !validShapes.has(shapeId as FlowerShapeId)) continue;
    if (typeof colourId !== "string" || !validColours.has(colourId)) continue;
    const n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n < 1) continue;
    stems.push({ shape: shapeId as FlowerShapeId, colour: colourId, qty: Math.min(n, MAX_STEMS) });
  }

  if (stems.length === 0) return null;

  // Trim to the overall stem cap, keeping earlier groups intact.
  let running = 0;
  const capped: BuildStem[] = [];
  for (const s of stems) {
    if (running >= MAX_STEMS) break;
    const qty = Math.min(s.qty, MAX_STEMS - running);
    capped.push({ ...s, qty });
    running += qty;
  }

  const wrapOk = typeof p.w === "string" && wraps.some((w) => w.id === p.w);
  const ribbonOk = typeof p.r === "string" && ribbons.some((r) => r.id === p.r);

  return {
    stems: capped,
    wrap: wrapOk ? (p.w as string) : emptyBuild.wrap,
    ribbon: ribbonOk ? (p.r as string) : emptyBuild.ribbon,
    name: typeof p.n === "string" ? p.n.slice(0, 60) : undefined,
  };
}

/* --- human-readable summary ------------------------------------------------
 * Used in the order email, the Messenger message and the order form's recap.
 * Deliberately plain text so it survives being pasted anywhere.
 * ------------------------------------------------------------------------- */

export function describeBuild(b: BouquetBuild): string[] {
  const lines = b.stems.map(
    (s) => `${shape(s.shape).name} · ${wire(s.colour).name} × ${s.qty}`,
  );
  lines.push(`Wrap: ${wrapById(b.wrap).name}`);
  lines.push(`Ribbon: ${ribbonById(b.ribbon).name}`);
  return lines;
}

export function buildSummaryText(b: BouquetBuild): string {
  const head = b.name?.trim() ? `"${b.name.trim()}" — ` : "";
  return `${head}${buildStemCount(b)} stems\n${describeBuild(b).join("\n")}`;
}
