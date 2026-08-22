"use client";

import { create } from "zustand";
import type { FlowerShapeId } from "./flowers";
import { flowerShapes, ribbons, wraps } from "./flowers";
import { nearestWires, wireColours } from "./wire-colours";
import {
  MAX_STEMS,
  MAX_STEM_GROUPS,
  buildStemCount,
  emptyBuild,
  type BouquetBuild,
} from "./build-encode";

/* ===========================================================================
 * BUILDER STATE
 *
 * Shape is chosen before colour, deliberately — every shape comes in every
 * colour, and that ordering is the whole sales pitch. Making colour the second,
 * always-available step is how the interface says so without a paragraph of
 * copy explaining it.
 * =========================================================================== */

interface BuilderState {
  build: BouquetBuild;
  activeShape: FlowerShapeId;
  activeColour: string;
  /** Set once a shared link has been loaded, so we don't clobber it. */
  hydrated: boolean;

  setActiveShape: (id: FlowerShapeId) => void;
  setActiveColour: (id: string) => void;
  addActive: (qty?: number) => void;
  setQty: (index: number, qty: number) => void;
  removeGroup: (index: number) => void;
  recolour: (index: number, colour: string) => void;
  toggleWrap: (id: string) => void;
  setRibbon: (id: string) => void;
  setName: (name: string) => void;
  load: (build: BouquetBuild) => void;
  reset: () => void;
  surprise: (seed: number) => void;
}

/** Merge into an existing group of the same shape+colour rather than repeating it. */
function addStem(
  build: BouquetBuild,
  shape: FlowerShapeId,
  colour: string,
  qty: number,
): BouquetBuild {
  const room = MAX_STEMS - buildStemCount(build);
  if (room <= 0) return build;

  const add = Math.min(qty, room);
  const at = build.stems.findIndex((s) => s.shape === shape && s.colour === colour);

  if (at >= 0) {
    const stems = build.stems.map((s, i) =>
      i === at ? { ...s, qty: s.qty + add } : s,
    );
    return { ...build, stems };
  }

  if (build.stems.length >= MAX_STEM_GROUPS) return build;
  return { ...build, stems: [...build.stems, { shape, colour, qty: add }] };
}

export const useBuilder = create<BuilderState>((set) => ({
  build: emptyBuild,
  activeShape: "rose",
  activeColour: "ruby",
  hydrated: false,

  setActiveShape: (id) =>
    set((s) => {
      const def = flowerShapes.find((f) => f.id === id);
      // Switching to foliage while "Ruby" is selected would offer a red leaf,
      // so each shape falls back to a colour that suits it.
      const keepColour =
        id === "leaf"
          ? ["fern", "sage", "forest", "olive", "mint"].includes(s.activeColour)
          : s.activeColour !== "fern";

      return {
        activeShape: id,
        activeColour: keepColour ? s.activeColour : (def?.defaultColour ?? s.activeColour),
      };
    }),

  setActiveColour: (id) => set({ activeColour: id }),

  addActive: (qty = 1) =>
    set((s) => ({ build: addStem(s.build, s.activeShape, s.activeColour, qty) })),

  setQty: (index, qty) =>
    set((s) => {
      if (qty < 1) {
        return { build: { ...s.build, stems: s.build.stems.filter((_, i) => i !== index) } };
      }
      const others = buildStemCount(s.build) - (s.build.stems[index]?.qty ?? 0);
      const capped = Math.min(qty, MAX_STEMS - others);
      return {
        build: {
          ...s.build,
          stems: s.build.stems.map((st, i) => (i === index ? { ...st, qty: capped } : st)),
        },
      };
    }),

  removeGroup: (index) =>
    set((s) => ({
      build: { ...s.build, stems: s.build.stems.filter((_, i) => i !== index) },
    })),

  recolour: (index, colour) =>
    set((s) => ({
      build: {
        ...s.build,
        stems: s.build.stems.map((st, i) => (i === index ? { ...st, colour } : st)),
      },
    })),

  /*
   * Wrap is a preference list, not one answer. Tapping a swatch adds it,
   * tapping it again takes it away, and the first one still standing is what
   * the 3D renders and what the estimate is priced on.
   *
   * "No wrap" can't sit alongside a colour preference — asking for bare stems
   * *or* plum paper isn't a preference, it's two different orders — so picking
   * it clears the rest, and picking a colour clears it.
   */
  toggleWrap: (id) =>
    set((s) => {
      const current = [s.build.wrap, ...(s.build.wrapAlts ?? [])];

      if (id === "none") return { build: { ...s.build, wrap: "none", wrapAlts: [] } };

      const next = current.includes(id)
        ? current.filter((w) => w !== id)
        : [...current.filter((w) => w !== "none"), id];

      // Never leave nothing selected — the last swatch can't be turned off.
      if (next.length === 0) return s;

      return { build: { ...s.build, wrap: next[0], wrapAlts: next.slice(1) } };
    }),
  setRibbon: (id) => set((s) => ({ build: { ...s.build, ribbon: id } })),
  setName: (name) => set((s) => ({ build: { ...s.build, name } })),

  load: (build) => set({ build, hydrated: true }),
  reset: () =>
    set({
      build: { ...emptyBuild },
      activeShape: flowerShapes[0]?.id ?? "rose",
      activeColour: flowerShapes[0]?.defaultColour ?? "ruby",
      hydrated: true,
    }),

  surprise: (seed) =>
    set(() => {
      // Deterministic from the seed, so "surprise me" is reproducible when
      // someone shares what it gave them.
      let n = Math.floor(seed) || 1;
      const rand = () => {
        n = (n * 1664525 + 1013904223) % 4294967296;
        return n / 4294967296;
      };
      const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

      /*
       * Pick one lead colour, then choose companions that sit near it in hue.
       * Picking at random from the whole shelf gives a clashing bouquet; this
       * is what makes "surprise me" produce something you'd actually send.
       */
      const greens = new Set(["mint", "sage", "fern", "forest", "olive"]);
      const palette = wireColours.filter((c) => !greens.has(c.id));
      const lead = pick(palette);
      const near = nearestWires(lead.hex, 6)
        .map((m) => m.colour)
        .filter((c) => !greens.has(c.id));

      const blooms = flowerShapes.filter((f) => f.id !== "leaf");
      let build: BouquetBuild = {
        stems: [],
        wrap: pick(wraps.filter((w) => w.id !== "none")).id,
        wrapAlts: [],
        ribbon: pick(ribbons).id,
      };

      build = addStem(build, pick(blooms).id, lead.id, 4 + Math.floor(rand() * 4));
      build = addStem(build, pick(blooms).id, pick(near).id, 3 + Math.floor(rand() * 3));
      build = addStem(build, "bud", pick(near).id, 2 + Math.floor(rand() * 3));
      build = addStem(build, "leaf", pick(["fern", "sage", "olive", "forest"]), 3);

      return { build, hydrated: true };
    }),
}));
