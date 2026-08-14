"use client";

import { useMemo } from "react";
import Stage from "@/components/three/Stage";
import Flower from "@/components/three/Flower";
import type { FlowerShape } from "@/lib/flowers";

/**
 * A single flower, rebuilt as you drag the sliders.
 *
 * The geometry cache is keyed on every geometry value (see flower-geometry.ts),
 * so each change produces a genuinely new flower rather than a cached old one.
 * Without that this preview would look frozen and the sliders would seem broken.
 */
export default function FlowerPreview({
  shape,
  colour,
}: {
  shape: FlowerShape;
  colour: string;
}) {
  // A stable object identity per set of values, so R3F only rebuilds on a real
  // change rather than on every parent render.
  const def = useMemo(
    () => shape,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(shape.geometry), shape.id],
  );

  /*
   * Drop the whole flower so its head sits at the camera's eye level (Stage
   * puts the camera at y = 0.9). Without this the bloom rides off the top of a
   * square frame and you're mostly looking at stem — and the stem is the one
   * part these sliders don't change.
   */
  const lift = 0.9 - def.geometry.stemLength;

  return (
    <Stage
      // Enough margin that the widest, most open shape still fits.
      distance={4.4}
      fov={34}
      groundShadow={false}
      richLighting
    >
      <group position={[0, lift, 0]}>
        <Flower shape={def.id} colour={colour} quality="high" fuzz def={def} />
      </group>
    </Stage>
  );
}
