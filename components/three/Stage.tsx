"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import {
  AdaptiveDpr,
  ContactShadows,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import * as THREE from "three";

/* ===========================================================================
 * THE STAGE
 *
 * Lighting is doing most of the work here. Chenille only reads as chenille when
 * something bright sits behind it: the rim light is what lights up the fibres
 * standing off each petal's edge, and it's the difference between "fuzzy wire
 * flower" and "shiny plastic flower". Turn it down and the whole illusion goes.
 *
 * The environment is built from in-scene lightformers rather than a loaded HDR,
 * so there's nothing to download and nothing to fail.
 * =========================================================================== */

export interface StageProps {
  children: ReactNode;
  /** Camera distance. Bigger = further away. */
  distance?: number;
  fov?: number;
  height?: number;
  className?: string;
  /** Soft shadow pooled under the bouquet. */
  groundShadow?: boolean;
  /** Set false to skip the extra environment pass on weak devices. */
  richLighting?: boolean;
  onCreated?: (state: { gl: THREE.WebGLRenderer }) => void;
}

export default function Stage({
  children,
  distance = 7.4,
  fov = 36,
  className,
  groundShadow = true,
  richLighting = true,
  onCreated,
}: StageProps) {
  // Drop resolution rather than frames when the GPU starts struggling.
  const [dpr, setDpr] = useState(1.5);

  /*
   * Stop rendering entirely once the canvas scrolls off screen.
   *
   * Without this the hero bouquet keeps animating at 60fps for the whole length
   * of the page — burning battery on a phone to draw something nobody can see.
   * `frameloop="never"` halts the loop; it restarts the moment it's back in view.
   */
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      // A little margin so it's already running by the time it scrolls in.
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);

    // A backgrounded tab should not be animating either.
    const onVisibility = () => {
      if (document.hidden) setVisible(false);
      else setVisible(el.getBoundingClientRect().bottom > -200);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={hostRef} className="h-full w-full">
      <Canvas
        className={className}
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        camera={{ position: [0, 0.9, distance], fov }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          // The page ground is dark; letting three tone-map to it keeps the
          // vivid wire colours from clipping to white at the highlights.
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.15;
          onCreated?.(state as unknown as { gl: THREE.WebGLRenderer });
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.75)}
        />

        {/* Ambient, tinted toward the aubergine ground so nothing floats. */}
        <ambientLight intensity={0.55} color="#c9a9c6" />

        {/* Key: warm, high, front-right. */}
        <directionalLight
          position={[5, 7, 5]}
          intensity={2.3}
          color="#fff2df"
        />

        {/* Fill: cool, low, left — stops the shadow side going flat black. */}
        <directionalLight
          position={[-6, 1.5, 3]}
          intensity={0.75}
          color="#a8bfe8"
        />

        {/*
        Rim. The important one. Sits behind and slightly above, and lights the
        fuzz halo that makes the material believable.
      */}
        <directionalLight
          position={[0, 3.5, -7]}
          intensity={4.2}
          color="#ffd7a3"
        />

        {/* A little colour bouncing back up from below. */}
        <pointLight
          position={[0, -2.5, 2.5]}
          intensity={12}
          distance={9}
          color="#ee9bae"
        />

        {richLighting ? (
          <Environment resolution={64}>
            <Lightformer
              intensity={2.4}
              position={[0, 4, -6]}
              scale={[10, 6, 1]}
              color="#ffe0b8"
            />
            <Lightformer
              intensity={1.1}
              position={[-5, 1, 2]}
              scale={[6, 6, 1]}
              color="#b9c9ef"
            />
            <Lightformer
              intensity={0.9}
              position={[5, 2, 3]}
              scale={[6, 6, 1]}
              color="#ffd9e2"
            />
          </Environment>
        ) : null}

        {children}

        {groundShadow ? (
          <ContactShadows
            position={[0, -2.6, 0]}
            opacity={0.5}
            scale={12}
            blur={3.2}
            far={5}
            resolution={256}
            color="#0c0710"
          />
        ) : null}

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
