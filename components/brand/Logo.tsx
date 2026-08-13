"use client";

import { useId } from "react";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * THE LOCKET — Little Charmer's mark.
 *
 * A jump ring and a locket with a bloom sealed inside: the shop name taken
 * literally. The bloom's centre is punched out with a mask rather than filled
 * with a background colour, so the mark sits correctly on any surface.
 *
 * Everything is drawn in `currentColor` — set the colour with a text class.
 * =========================================================================== */

export function LocketMark({
  className,
  animate = false,
  title,
}: {
  className?: string;
  /** Draws the ring and locket on, then blooms the petals open. */
  animate?: boolean;
  /** Accessible name. Omit for a decorative mark sitting next to real text. */
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const maskId = `lc-bloom-${uid}`;
  const titleId = `lc-title-${uid}`;

  // Five petals, rotated about the bloom's centre.
  const petals = [0, 72, 144, 216, 288];

  return (
    <svg
      viewBox="0 0 120 134"
      fill="none"
      className={clsx(animate && "lc-mark-animate", className)}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
    >
      {title ? <title id={titleId}>{title}</title> : null}

      <mask id={maskId}>
        <rect x="0" y="0" width="120" height="134" fill="#fff" />
        <circle cx="60" cy="78" r="5.4" fill="#000" />
      </mask>

      {/* jump ring */}
      <circle
        className="lc-ring"
        cx="60"
        cy="14"
        r="8.6"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="lc-link"
        d="M60 22.6v6.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* locket */}
      <circle
        className="lc-case"
        cx="60"
        cy="78"
        r="44"
        stroke="currentColor"
        strokeWidth="2.6"
      />
      <circle
        className="lc-case-inner"
        cx="60"
        cy="78"
        r="37.2"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />

      {/* the bloom, sealed inside */}
      <g mask={`url(#${maskId})`} fill="currentColor">
        {petals.map((deg, i) => (
          <ellipse
            key={deg}
            className="lc-petal"
            cx="0"
            cy="-13.4"
            rx="7.1"
            ry="13.4"
            transform={`translate(60 78) rotate(${deg})`}
            style={{ ["--i" as string]: i }}
          />
        ))}
      </g>
      <circle className="lc-pistil" cx="60" cy="78" r="2.7" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------------- */

type LogoVariant = "horizontal" | "stacked" | "mark";

export default function Logo({
  variant = "horizontal",
  className,
  markClassName,
  animate = false,
  tagline = false,
}: {
  variant?: LogoVariant;
  className?: string;
  markClassName?: string;
  animate?: boolean;
  /** Show "flowers that never wilt" under the name. */
  tagline?: boolean;
}) {
  if (variant === "mark") {
    return (
      <LocketMark
        className={clsx("h-10 w-auto", markClassName, className)}
        animate={animate}
        title="Little Charmer"
      />
    );
  }

  const stacked = variant === "stacked";

  return (
    <span
      className={clsx(
        "inline-flex select-none",
        stacked ? "flex-col items-center gap-3" : "flex-row items-center gap-3",
        className,
      )}
    >
      <LocketMark
        className={clsx(stacked ? "h-16 w-auto" : "h-9 w-auto", markClassName)}
        animate={animate}
      />
      <span
        className={clsx(
          "font-display leading-[0.95]",
          stacked ? "text-center" : "text-left",
        )}
      >
        <span className="block text-[1.35em] tracking-[-0.01em]">Little</span>
        <span className="block text-[1.35em] italic tracking-[-0.01em]">Charmer</span>
        {tagline ? (
          <span className="eyebrow mt-1.5 block text-[0.42em] leading-normal">
            Flowers that never wilt
          </span>
        ) : null}
      </span>
    </span>
  );
}
