"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* ===========================================================================
 * Smooth scrolling.
 *
 * Lenis only — it eases the real scroll position and never touches the DOM
 * structure, so it can't get into an argument with React about which node
 * belongs where.
 *
 * There used to be GSAP ScrollTrigger here as well, driving a pinned section.
 * Pinning works by reparenting the pinned element into a generated spacer, and
 * React then throws "Failed to execute 'removeChild'" when that page unmounts.
 * The pin is CSS `position: sticky` now, so GSAP isn't needed at all.
 *
 * Anyone who has asked for reduced motion gets plain native scrolling.
 * =========================================================================== */

let lenisInstance: Lenis | null = null;

/** The shared Lenis instance, or null when smooth scrolling is off. */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

/** Scroll to an element or offset, working with or without Lenis. */
export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "auto" });
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let frame = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        // Gentle exponential ease-out. Anything springier makes a long page
        // feel seasick.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 1.6,
        smoothWheel: true,
      });
      lenisInstance = lenis;

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    }

    // Same-page anchors, routed through Lenis so they ease rather than jump.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;

      const el = document.querySelector<HTMLElement>(href);
      if (!el) return;

      e.preventDefault();
      scrollToTarget(el);
      history.replaceState(null, "", href);
      // Keep keyboard focus with the visual jump.
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
