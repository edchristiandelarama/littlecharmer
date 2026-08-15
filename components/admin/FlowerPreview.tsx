"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Flower from "@/components/three/Flower";
import type { FlowerShape } from "@/lib/flowers";

/* ===========================================================================
 * The flower being edited, live.
 *
 * Its own Canvas rather than the shared Stage, because this needs framing the
 * shared one deliberately doesn't do: the head centred in view and free
 * rotation, so a shape can be checked from underneath and behind.
 *
 * The head sits at +Y = stemLength in the flower's own space, so the whole
 * thing is shifted DOWN by that much to bring the bloom to the origin — which
 * is what OrbitControls turns around. Framing on the origin without that shift
 * is what put the flower half out of frame with the stem taking the middle.
 * =========================================================================== */

export default function FlowerPreview({
  shape,
  colour,
}: {
  shape: FlowerShape;
  colour: string;
}) {
  const def = useMemo(
    () => shape,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(shape.geometry), shape.id],
  );

  const hostRef = useRef<HTMLDivElement>(null);

  // Same wheel problem as the builder: Lenis scrolls the page itself, so it has
  // to be told to leave this alone or zooming drags the admin up and down.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const swallow = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", swallow, { passive: false });
    return () => el.removeEventListener("wheel", swallow);
  }, []);

  // Frame on the bloom, with room for the widest, most open shape.
  const distance = 1.6 + def.geometry.petalLength * 3.4;

  return (
    <div
      ref={hostRef}
      data-lenis-prevent
      className="h-full w-full"
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, distance], fov: 34 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.15;
        }}
      >
        <ambientLight intensity={0.6} color="#c9a9c6" />
        <directionalLight position={[4, 5, 4]} intensity={2.2} color="#fff2df" />
        <directionalLight position={[-5, 1, 3]} intensity={0.8} color="#a8bfe8" />
        {/* The rim light — what makes the fuzz read as fuzz. */}
        <directionalLight position={[0, 3, -5]} intensity={3.6} color="#ffd7a3" />

        <Environment resolution={64}>
          <Lightformer
            intensity={2.2}
            position={[0, 3, -5]}
            scale={[8, 5, 1]}
            color="#ffe0b8"
          />
          <Lightformer
            intensity={1}
            position={[-4, 1, 2]}
            scale={[5, 5, 1]}
            color="#b9c9ef"
          />
        </Environment>

        {/* Bloom pulled back to the origin so it's both centred and the point
            the camera orbits around. */}
        <group position={[0, -def.geometry.stemLength, 0]}>
          <Flower shape={def.id} colour={colour} quality="high" fuzz def={def} />
        </group>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          minDistance={1.2}
          maxDistance={9}
          // Full vertical range on purpose: checking a shape from underneath is
          // exactly what you want when tuning how open the petals sit.
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
