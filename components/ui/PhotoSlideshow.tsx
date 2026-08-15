"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * A cross-fading run of photographs.
 *
 * Every photo stays mounted and only its opacity changes. Swapping a single
 * `src` instead would re-request the image on each change and flash empty in
 * the gap — which is exactly when a shopper is looking hardest at the picture.
 *
 * Two modes:
 *   "hover" — advances only while the pointer is over it (shop cards)
 *   "auto"  — advances on its own (the About section)
 *
 * A single photo never animates, and neither mode animates for anyone who has
 * asked for reduced motion.
 * =========================================================================== */

export default function PhotoSlideshow({
  photos,
  alt,
  mode = "auto",
  interval = 2200,
  active = true,
  sizes,
  className,
  imageClassName,
  priority = false,
  showDots = false,
}: {
  photos: string[];
  alt: string;
  mode?: "hover" | "auto";
  /** Milliseconds per photo. */
  interval?: number;
  /** In "hover" mode, whether the pointer is currently over the card. */
  active?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showDots?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const running = photos.length > 1 && (mode === "auto" || active);

  useEffect(() => {
    if (!running || reduced.current) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [running, photos.length, interval]);

  // Back to the first photo when the pointer leaves, so every card looks the
  // same in a grid rather than each one frozen wherever it happened to stop.
  useEffect(() => {
    if (mode === "hover" && !active) setIndex(0);
  }, [mode, active]);

  if (photos.length === 0) return null;

  return (
    <div className={clsx("relative", className)}>
      {photos.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          aria-hidden={i === 0 ? undefined : true}
          fill
          sizes={sizes}
          priority={priority && i === 0}
          className={clsx(
            "object-cover transition-opacity duration-700 ease-[var(--ease-out-soft)]",
            i === index ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ))}

      {showDots && photos.length > 1 ? (
        <ol
          aria-hidden
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
        >
          {photos.map((src, i) => (
            <li
              key={src}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-5 bg-cream" : "w-1.5 bg-cream/40",
              )}
            />
          ))}
        </ol>
      ) : null}
    </div>
  );
}
