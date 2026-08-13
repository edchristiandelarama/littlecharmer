"use client";

import { useId, useState } from "react";
import clsx from "@/lib/clsx";

export interface AccordionItem {
  q: string;
  a: string;
}

/**
 * FAQ accordion.
 *
 * Built on buttons and aria-expanded rather than <details>, because the height
 * transition needs a measured max-height and <details> can't animate open
 * consistently across browsers. All answers stay in the DOM so they're
 * searchable with the browser's own find and readable by search engines.
 */
export default function Accordion({
  items,
  className,
  /** Index open on first render. -1 for all closed. */
  initial = 0,
}: {
  items: readonly AccordionItem[];
  className?: string;
  initial?: number;
}) {
  const [open, setOpen] = useState(initial);
  const uid = useId().replace(/:/g, "");

  return (
    <div className={clsx("divide-y divide-line border-y border-line", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;

        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-brass-bright"
              >
                <span className="font-display text-xl sm:text-2xl">{item.q}</span>
                <span
                  aria-hidden
                  className={clsx(
                    "mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-400",
                    isOpen
                      ? "rotate-45 border-brass bg-brass text-ink"
                      : "border-line-firm text-brass",
                  )}
                >
                  <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={clsx(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-6 pr-10 text-cream-2">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
