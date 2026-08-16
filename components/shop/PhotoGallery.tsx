"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * The product page gallery.
 *
 * Unlike the shop card — which fades on its own to catch the eye — this one is
 * driven entirely by the customer: arrows, thumbnails, arrow keys, and a swipe
 * on touch. By the time someone is on a product page they're studying it, and
 * a picture that moves on its own while you're looking at a detail is a
 * nuisance rather than a flourish.
 * =========================================================================== */

export default function PhotoGallery({
  photos,
  alt,
  className,
}: {
  photos: string[];
  alt: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const many = photos.length > 1;
  const go = (next: number) =>
    setIndex((next + photos.length) % photos.length);

  // Arrow keys, but only while the gallery has focus — hijacking them for the
  // whole page would break normal scrolling.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || !many) return;

    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, many, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <div
        ref={hostRef}
        tabIndex={many ? 0 : -1}
        role={many ? "group" : undefined}
        aria-label={many ? `${alt} — ${photos.length} photos` : undefined}
        className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 46vw, 92vw"
            className={clsx(
              "object-cover transition-opacity duration-500 ease-[var(--ease-out-soft)]",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        {many ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur transition-all hover:bg-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <span className="sr-only">Previous photo</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M15 5l-7 7 7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-cream backdrop-blur transition-all hover:bg-ink focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <span className="sr-only">Next photo</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M9 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-2xs tabular-nums text-cream-2 backdrop-blur">
              {index + 1} / {photos.length}
            </p>
          </>
        ) : null}
      </div>

      {many ? (
        <ul className="grid grid-cols-5 gap-2">
          {photos.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={clsx(
                  "relative block aspect-square w-full overflow-hidden rounded-lg border transition-all",
                  i === index
                    ? "border-brass opacity-100"
                    : "border-line opacity-55 hover:opacity-100",
                )}
              >
                <span className="sr-only">{`Photo ${i + 1}`}</span>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
