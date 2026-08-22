"use client";

import { useEffect, useRef } from "react";
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
  const hostRef = useRef<HTMLDivElement>(null);

  /*
   * Stop a scroll-to-zoom from ALSO scrolling the page.
   *
   * This needs two separate defences, because two different things want to
   * scroll:
   *
   *   1. `data-lenis-prevent` on the wrapper. Lenis doesn't rely on native
   *      scrolling — it reads the wheel delta and scrolls the page itself — so
   *      preventDefault alone does nothing to it. This attribute is how Lenis
   *      is told to ignore a region.
   *   2. A native, non-passive wheel listener calling preventDefault, for the
   *      browser's own scrolling when Lenis is off (anyone on reduced motion).
   *      React's onWheel is registered passively and isn't allowed to cancel.
   */
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const swallow = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", swallow, { passive: false });
    return () => el.removeEventListener("wheel", swallow);
  }, []);

  return (
    <div
      ref={hostRef}
      data-lenis-prevent
      className="h-full w-full"
      // touch-none lets a pinch zoom the bouquet instead of the page;
      // overscroll-contain stops any scroll chaining to the document.
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
    >
      {/*
        Framed wider than the hero on purpose. The hero can crop the wrap off
        the bottom for a better composition; here the wrap is something you're
        actively choosing, so the whole bouquet has to stay in frame.
      */}
      <Stage
        distance={6.8}
        fov={34}
        richLighting={quality === "high"}
        groundShadow
      >
        <group position={[0, -1.45, 0]}>
          <Bouquet
            build={build}
            quality={quality}
            fuzz={fuzz}
            sway={false}
            // No stems, no paper. An empty bouquet still drew its wrap, so an
            // untouched builder showed a cone of kraft standing on its own
            // with the "pick a shape" invitation printed over the top of it.
            showWrap={build.stems.length > 0}
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
    </div>
  );
}
