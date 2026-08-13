"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { announcements } from "@/lib/site.config";

/* ===========================================================================
 * The thin strip at the very top. Rotates through the lines in site.config.
 * Pauses on hover and on focus, and doesn't rotate at all for anyone who has
 * asked for reduced motion — a line of text swapping itself out is exactly the
 * kind of thing that setting exists for.
 * =========================================================================== */

const ROTATE_MS = 5200;

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = announcements.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) return null;

  const current = announcements[index];

  const body = (
    <span key={index} className="animate-[fade-up_0.6s_var(--ease-out-soft)]">
      {current.text}
    </span>
  );

  return (
    <div
      className="relative z-50 border-b border-line/70 bg-void text-cream-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container-page flex min-h-9 items-center justify-center gap-3 py-1.5">
        <span
          aria-hidden
          className="hidden h-1 w-1 shrink-0 rounded-full bg-brass sm:block"
        />
        <p
          className="text-center text-xs tracking-wide sm:text-sm"
          // Announces changes without stealing focus.
          aria-live="polite"
          aria-atomic="true"
        >
          {current.href ? (
            <Link
              href={current.href}
              className="underline decoration-brass/50 underline-offset-4 transition-colors hover:text-brass-bright hover:decoration-brass"
            >
              {body}
            </Link>
          ) : (
            body
          )}
        </p>
        <span
          aria-hidden
          className="hidden h-1 w-1 shrink-0 rounded-full bg-brass sm:block"
        />
      </div>
    </div>
  );
}
