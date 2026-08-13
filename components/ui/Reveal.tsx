"use client";

import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * Scroll reveal.
 *
 * One IntersectionObserver per element, unobserved as soon as it has fired —
 * these never need to reverse, so keeping observers alive for the whole page
 * would be pure overhead.
 *
 * The hidden state lives behind `html.js` in globals.css, so content is fully
 * visible if JavaScript never arrives.
 * =========================================================================== */

export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  /** Stagger, in milliseconds. */
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen at load reveals immediately — no flash of
    // hidden content above the fold.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // createElement rather than <Tag>: a polymorphic `as` combined with a ref
  // collapses the JSX prop types to `never`, and this keeps it readable without
  // a pile of generics for what is a one-line component.
  return createElement(
    Tag,
    {
      ref,
      id,
      className: clsx("reveal", className),
      style: delay
        ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
        : undefined,
    },
    children,
  );
}

/* ------------------------------------------------------------------------- */

/** A brass rule that draws itself left-to-right when it scrolls into view. */
export function RuleDraw({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden className={clsx("rule-draw", className)} />;
}
