"use client";

import { OrbitControls } from "@react-three/drei";
import Stage from "@/components/three/Stage";
import Bouquet from "@/components/three/Bouquet";
import type { BouquetBuild } from "@/lib/build-encode";
import type { Quality } from "@/components/three/flower-geometry";

/** The turntable in the middle of the builder. */
export default function BuilderStage({
  build,
  quality = "high",
  fuzz = true,
}: {
  build: BouquetBuild;
  quality?: Quality;
  fuzz?: boolean;
}) {
  return (
    /*
     * Framed wider than the hero on purpose. The hero can crop the wrap off the
     * bottom for a better composition; here the wrap is something you're
     * actively choosing, so the whole bouquet has to stay in frame.
     */
    <Stage distance={6.8} fov={34} richLighting={quality === "high"} groundShadow>
      <group position={[0, -1.45, 0]}>
        <Bouquet
          build={build}
          quality={quality}
          fuzz={fuzz}
          sway={false}
          showWrap
          spread={0.42}
        />
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        // Locked to a turntable: free orbit lets people end up underneath the
        // bouquet looking at the inside of the wrap, which just looks broken.
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.52}
        minDistance={4}
        maxDistance={9}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.65}
        target={[0, 0.1, 0]}
      />
    </Stage>
  );
}
