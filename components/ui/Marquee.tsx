"use client";

import type { ReactNode } from "react";
import clsx from "@/lib/clsx";

/**
 * A slow horizontal marquee.
 *
 * The children are rendered twice and the track translates by exactly -50%, so
 * the loop is seamless without measuring anything. The duplicate is hidden from
 * assistive tech, which would otherwise read every review twice.
 *
 * Pauses on hover and on keyboard focus so a link inside can actually be
 * clicked, and holds still entirely under prefers-reduced-motion.
 */
export default function Marquee({
  children,
  speed = 68,
  reverse = false,
  className,
}: {
  children: ReactNode;
  /** Seconds for one full pass. Higher is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "group relative flex overflow-hidden",
        // Fade the ends so items enter and leave rather than popping.
        "[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]",
        className,
      )}
    >
      {/* Two identical halves, so translating the track by exactly -50% lands
          the copy where the original started. Any width difference between the
          halves — even a stray trailing gap — shows up as a visible jump. */}
      <div
        className={clsx(
          "flex w-max",
          "motion-safe:animate-[marquee_var(--speed)_linear_infinite]",
          "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ ["--speed" as string]: `${speed}s` }}
      >
        <span className="flex shrink-0 gap-4 pr-4">{children}</span>
        <span aria-hidden className="flex shrink-0 gap-4 pr-4">
          {children}
        </span>
      </div>
    </div>
  );
}
