"use client";

import { useMemo } from "react";
import * as THREE from "three";
import {
  shape as shapeDef,
  type FlowerShape,
  type FlowerShapeId,
} from "@/lib/flowers";
import { wire } from "@/lib/wire-colours";
import { buildFlowerGeometry, type Quality } from "./flower-geometry";
import { chenilleMaterial, haloMaterial } from "./chenille";

/** Green chenille, wrapped around every stem. */
export const STEM_GREEN = "#4e8b4a";

export interface FlowerProps {
  shape: FlowerShapeId;
  colour: string;
  quality?: Quality;
  /** The fuzz halo. Worth the extra draw call on the hero; skipped on weak GPUs. */
  fuzz?: boolean;
  /**
   * Render these dimensions instead of the saved ones.
   *
   * Only the admin's live preview uses this: it needs to draw the shape as
   * currently edited, which by definition isn't the one saved on disk yet.
   */
  def?: FlowerShape;
}

/**
 * One flower, stem base at the origin, head up at +Y.
 * Geometry and materials both come from caches, so twelve identical roses cost
 * about the same as one.
 */
export default function Flower({
  shape,
  colour,
  quality = "high",
  fuzz = true,
  def: override,
}: FlowerProps) {
  const def = override ?? shapeDef(shape);
  const geo = useMemo(() => buildFlowerGeometry(def, quality), [def, quality]);

  const wireColour = wire(colour);
  const hex = wireColour.hex;

  const petalMat = useMemo(
    () => chenilleMaterial(hex, { detail: quality === "high" }),
    [hex, quality],
  );

  const stemMat = useMemo(
    () => chenilleMaterial(STEM_GREEN, { detail: quality === "high" }),
    [quality],
  );

  const centreHex = def.geometry.centreColour
    ? wire(def.geometry.centreColour).hex
    : hex;
  const centreMat = useMemo(
    () => chenilleMaterial(centreHex, { detail: quality === "high" }),
    [centreHex, quality],
  );

  const petalHalo = useMemo(
    () => (fuzz ? haloMaterial(hex, def.geometry.wireRadius * 0.42) : null),
    [fuzz, hex, def.geometry.wireRadius],
  );
  const stemHalo = useMemo(
    () => (fuzz ? haloMaterial(STEM_GREEN, def.geometry.wireRadius * 0.34) : null),
    [fuzz, def.geometry.wireRadius],
  );

  return (
    <group>
      <mesh geometry={geo.stem} material={stemMat} castShadow receiveShadow />
      {stemHalo ? <mesh geometry={geo.stem} material={stemHalo} /> : null}

      <mesh geometry={geo.petals} material={petalMat} castShadow receiveShadow />
      {petalHalo ? <mesh geometry={geo.petals} material={petalHalo} /> : null}

      {geo.centre ? (
        <mesh geometry={geo.centre} material={centreMat} castShadow receiveShadow />
      ) : null}
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * A single flower framed on its own — used for product cards and the picker.
 * ------------------------------------------------------------------------- */

export function SingleStem({
  shape,
  colour,
  quality = "low",
  fuzz = false,
}: FlowerProps) {
  const def = shapeDef(shape);
  // Centre the head in frame rather than the stem base.
  const lift = -def.geometry.stemLength * 0.78;

  return (
    <group position={[0, lift, 0]} rotation={[0.08, 0, 0]}>
      <Flower shape={shape} colour={colour} quality={quality} fuzz={fuzz} />
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * The wrap: a cone of paper around the base of the stems.
 * ------------------------------------------------------------------------- */

/**
 * Paper cone around the stems.
 *
 * Proportion is the whole game: the paper has to reach up far enough to tuck
 * under the blooms. Leave a gap and you get bare green tubes through the middle
 * of the bouquet, which is what an arrangement in a vase looks like — not a
 * wrapped, hand-tied one.
 */
export function Wrap({
  hex,
  ribbonHex,
  radius = 1.1,
  height = 2.1,
}: {
  hex: string;
  ribbonHex: string;
  /** Radius at the open top. */
  radius?: number;
  height?: number;
}) {
  /*
   * The hexes in flowers.ts are the real paper colours, used for the swatches
   * in the picker. In the scene they're knocked well down: the lighting rig is
   * calibrated to make vivid chenille glow, and paper lit to the same level
   * becomes the brightest thing on the page and steals the whole composition.
   * Physically it checks out too — the paper is in the bouquet's own shadow.
   */
  const paper = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(hex).multiplyScalar(0.42),
        roughness: 0.97,
        metalness: 0,
        side: THREE.DoubleSide,
        sheen: 0.2,
        sheenRoughness: 0.95,
        sheenColor: new THREE.Color(hex).multiplyScalar(0.3),
        // Faceted, because wrapping paper is folded, not moulded. A smooth
        // cone reads as a traffic cone the moment you put flowers in it.
        flatShading: true,
      }),
    [hex],
  );

  const ribbon = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(ribbonHex).multiplyScalar(0.44),
        roughness: 0.52,
        metalness: 0.1,
        sheen: 0.7,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color(ribbonHex).multiplyScalar(0.4),
      }),
    [ribbonHex],
  );

  const bottomRadius = radius * 0.19;

  // Few radial segments on purpose — each face becomes a visible fold.
  const cone = useMemo(
    () => new THREE.CylinderGeometry(radius, bottomRadius, height, 11, 1, true),
    [radius, bottomRadius, height],
  );

  // The ribbon sits a third of the way up, and has to match the cone's radius
  // at exactly that height or it floats off the paper.
  const tieAt = 0.3;
  const tieRadius = bottomRadius + (radius - bottomRadius) * tieAt;
  const tie = useMemo(
    () => new THREE.TorusGeometry(tieRadius, tieRadius * 0.12, 10, 24),
    [tieRadius],
  );

  return (
    /* Base just below the tie point, top reaching up under the blooms. */
    <group position={[0, height * 0.46, 0]}>
      <mesh geometry={cone} material={paper} receiveShadow />
      <mesh
        geometry={tie}
        material={ribbon}
        position={[0, height * (tieAt - 0.5), 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />
    </group>
  );
}
