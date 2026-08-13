"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Stage from "@/components/three/Stage";
import Bouquet from "@/components/three/Bouquet";
import type { Quality } from "@/components/three/flower-geometry";
import { HERO_BUILD } from "./hero-build";

/** Assembles the bouquet on load, then hands the reins to the scroll position. */
function Choreography({
  progressRef,
  scrollRef,
  // Long enough that each stem's drop is a separate, watchable event — the
  // whole point of the entrance is that you see it being built.
  duration = 4.2,
}: {
  progressRef: React.RefObject<number>;
  scrollRef: React.RefObject<number>;
  duration?: number;
}) {
  const started = useRef<number | null>(null);

  useFrame((state, delta) => {
    if (started.current === null) started.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - started.current;

    // The entrance runs on its own so the bouquet is already there when the
    // page loads — an empty vase waiting for a scroll is a bad first frame.
    progressRef.current = Math.min(1, elapsed / duration);

    // Once it's built, scrolling lifts the camera and pulls it back, so the
    // hero keeps moving as you leave it. Eased toward the target rather than
    // snapped, so a flicked scroll on a phone doesn't jolt the view.
    const s = scrollRef.current ?? 0;
    const k = Math.min(1, delta * 4);

    // Framed a little above centre, so the blooms get more of the frame than
    // the wrap does — the flowers are what's being sold.
    // Framed the way a florist photographs a bouquet: tight on the blooms, with
    // the wrap running off the bottom of the frame rather than sitting in it as
    // a big brown triangle competing with the headline.
    state.camera.position.y += (1.15 + s * 1.0 - state.camera.position.y) * k;
    state.camera.position.z += (5.6 + s * 2.4 - state.camera.position.z) * k;
    state.camera.lookAt(0, 0.75 + s * 0.45, 0);
  });

  return null;
}

export default function HeroStage({
  quality = "high",
  fuzz = true,
}: {
  quality?: Quality;
  fuzz?: boolean;
}) {
  const progressRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      // 0 at the top of the page, 1 once the hero has scrolled fully away.
      const h = window.innerHeight || 1;
      scrollRef.current = Math.max(0, Math.min(1, window.scrollY / h));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Stage
      distance={5.6}
      fov={36}
      richLighting={quality === "high"}
      groundShadow={false}
    >
      <Choreography progressRef={progressRef} scrollRef={scrollRef} />
      <group position={[0, -1.5, 0]}>
        <Bouquet
          build={HERO_BUILD}
          progressRef={progressRef}
          quality={quality}
          fuzz={fuzz}
          sway
          showWrap
          spread={0.44}
        />
      </group>
    </Stage>
  );
}
