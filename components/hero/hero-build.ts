import type { BouquetBuild } from "@/lib/build-encode";

/*
 * The hero bouquet — bigger and more mixed than anything in the catalogue,
 * because its job is to show the range in one glance.
 *
 * This lives in its own module on purpose. Both the 3D canvas and the static
 * SVG fallback need it, and the fallback is in the main bundle. If it were
 * exported from HeroStage.tsx, importing it would drag three.js and drei into
 * the initial page load and quietly undo the dynamic import that keeps them out.
 */
export const HERO_BUILD: BouquetBuild = {
  stems: [
    { shape: "rose", colour: "ruby", qty: 4 },
    { shape: "rose", colour: "blush", qty: 4 },
    { shape: "tulip", colour: "ivory", qty: 3 },
    { shape: "daisy", colour: "sunbeam", qty: 3 },
    { shape: "lily", colour: "lilac", qty: 2 },
    { shape: "bud", colour: "dusty-rose", qty: 3 },
    { shape: "leaf", colour: "fern", qty: 5 },
  ],
  wrap: "kraft",
  ribbon: "gold",
};
