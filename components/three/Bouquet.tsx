"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BouquetBuild } from "@/lib/build-encode";
import { ribbonById, wrapById, type FlowerShapeId } from "@/lib/flowers";
import { arrangeBouquet } from "./flower-geometry";
import Flower, { Wrap } from "./Flower";
import type { Quality } from "./flower-geometry";

interface Placed {
  shape: FlowerShapeId;
  colour: string;
  lean: number;
  azimuth: number;
  roll: number;
  scale: number;
}

/**
 * Flatten the build into individual stems, ordered so the bouquet reads well:
 * blooms round-robin through the middle, foliage pushed to the outside.
 *
 * Concatenating the groups naively would clump every rose in the centre and
 * every leaf on one side — which is exactly what a bouquet made by someone who
 * has never made one looks like.
 */
function orderStems(
  build: BouquetBuild,
): { shape: FlowerShapeId; colour: string }[] {
  const blooms: { shape: FlowerShapeId; colour: string }[][] = [];
  const foliage: { shape: FlowerShapeId; colour: string }[] = [];

  for (const group of build.stems) {
    const items = Array.from({ length: group.qty }, () => ({
      shape: group.shape,
      colour: group.colour,
    }));
    if (group.shape === "leaf") foliage.push(...items);
    else blooms.push(items);
  }

  // Round-robin so colours and shapes are mixed through the arrangement.
  const mixed: { shape: FlowerShapeId; colour: string }[] = [];
  const longest = Math.max(0, ...blooms.map((b) => b.length));
  for (let i = 0; i < longest; i++) {
    for (const group of blooms) {
      if (group[i]) mixed.push(group[i]);
    }
  }

  return [...mixed, ...foliage];
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Overshoot easing — the stem drops past its resting place and settles back.
 * A pure ease-out arrival is barely noticeable; this reads as something being
 * dropped into position and bouncing slightly, which is what makes the assembly
 * legible rather than subliminal.
 */
function easeOutBack(t: number): number {
  const c = 1.7;
  const p = t - 1;
  return 1 + (c + 1) * p * p * p + c * p * p;
}

/** How far above the bouquet a stem starts before it falls in. */
const DROP_HEIGHT = 7;

export interface BouquetProps {
  build: BouquetBuild;
  /**
   * Scroll-driven assembly, 0 → 1. Passed as a ref so scrubbing doesn't
   * re-render React on every frame. Omit for a fully assembled bouquet.
   */
  progressRef?: RefObject<number>;
  quality?: Quality;
  fuzz?: boolean;
  /** Gentle idle motion, as if someone is holding it. */
  sway?: boolean;
  showWrap?: boolean;
  spread?: number;
}

export default function Bouquet({
  build,
  progressRef,
  quality = "high",
  fuzz = true,
  sway = true,
  showWrap = true,
  spread = 0.44,
}: BouquetProps) {
  const placed = useMemo<Placed[]>(() => {
    const stems = orderStems(build);
    const layout = arrangeBouquet(stems.length, spread);
    return stems.map((s, i) => ({ ...s, ...layout[i] }));
  }, [build, spread]);

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const wrapRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);

  const wrap = wrapById(build.wrap);
  const ribbon = ribbonById(build.ribbon);

  useFrame((state) => {
    const p = progressRef ? clamp01(progressRef.current ?? 1) : 1;
    const t = state.clock.elapsedTime;
    const n = placed.length || 1;

    for (let i = 0; i < placed.length; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;

      const item = placed[i];

      // Staggered arrival, one stem at a time. The window per stem is narrow
      // (0.34 of the total) so each drop is a distinct event you can follow,
      // rather than everything fading up together.
      const delay = (i / n) * 0.66;
      const local = clamp01((p - delay) / 0.34);
      const e = easeOutBack(local);
      const settle = easeOutCubic(local);

      // Falls in from above and settles, rather than rising from below.
      g.position.y = (1 - e) * DROP_HEIGHT;

      // A slow turn on the way down, so the drop reads as a stem being placed
      // rather than a sprite sliding on a rail.
      const spin = (1 - settle) * Math.PI * 1.15;

      // Full size the whole way down — scaling up from nothing hides the fall.
      g.scale.setScalar(item.scale * (0.55 + 0.45 * settle));

      const swayAmount = sway
        ? Math.sin(t * 0.7 + i * 1.7) * 0.045 + Math.sin(t * 0.43 + i) * 0.028
        : 0;

      g.rotation.set(
        // Splayed wide while falling, drawing together as it lands.
        item.lean * (1 + (1 - settle) * 2.2) + swayAmount,
        item.azimuth + spin,
        swayAmount * 0.75 + (1 - settle) * 0.35,
      );
    }

    if (wrapRef.current) {
      const we = easeOutCubic(clamp01(p / 0.35));
      wrapRef.current.scale.setScalar(we);
      wrapRef.current.visible = we > 0.02;
    }

    if (rootRef.current && sway) {
      // A slow turn of the whole bouquet, so it keeps moving once assembled
      // and you can see round it without touching anything.
      rootRef.current.rotation.y = Math.sin(t * 0.24) * 0.22;
      rootRef.current.rotation.z = Math.sin(t * 0.19) * 0.022;
      rootRef.current.position.y = Math.sin(t * 0.5) * 0.055;
    }
  });

  return (
    <group ref={rootRef}>
      {showWrap && wrap.id !== "none" ? (
        <group ref={wrapRef}>
          <Wrap hex={wrap.hex} ribbonHex={ribbon.hex} />
        </group>
      ) : null}

      {placed.map((item, i) => (
        <group
          key={`${item.shape}-${item.colour}-${i}`}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          rotation={new THREE.Euler(item.lean, item.azimuth, 0, "YXZ")}
        >
          <Flower
            shape={item.shape}
            colour={item.colour}
            quality={quality}
            fuzz={fuzz}
          />
        </group>
      ))}
    </group>
  );
}
