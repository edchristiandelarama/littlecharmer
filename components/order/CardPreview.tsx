"use client";

import { useState } from "react";
import { LocketMark } from "@/components/brand/Logo";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * The gift card, typeset live.
 *
 * People freeze when asked to write a message into an empty box, so there are
 * starters they can drop in and edit. Seeing it set on the actual card is also
 * the moment they notice a message is too long for it.
 * =========================================================================== */

const STARTERS = [
  { label: "Congratulations", text: "So proud of you. You earned every bit of this." },
  { label: "Happy birthday", text: "Happy birthday. Here's something that won't be gone by next week." },
  { label: "Thank you", text: "Thank you — for more than I've probably said out loud." },
  { label: "Anniversary", text: "Still you. Still this. Every year." },
  { label: "Get well", text: "Thinking of you. No rush getting better." },
  { label: "Just because", text: "No occasion. I just saw these and thought of you." },
];

const LIMIT = 400;

export default function CardPreview({
  value,
  to,
  from,
  onChange,
  error,
}: {
  value: string;
  to?: string;
  from?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [showStarters, setShowStarters] = useState(false);
  const remaining = LIMIT - value.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        {/* the writing */}
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-cream-2">
              What should the card say?
              <span className="ml-1 text-muted">(optional)</span>
            </span>
            <textarea
              rows={5}
              value={value}
              maxLength={LIMIT}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write it in your own words — we copy it out by hand."
              className="w-full resize-y rounded-lg border border-line-firm bg-surface px-3.5 py-3 text-cream placeholder:text-faint transition-colors focus:border-brass"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowStarters((v) => !v)}
              aria-expanded={showStarters}
              className="text-xs text-brass underline underline-offset-4 hover:text-brass-bright"
            >
              {showStarters ? "Hide suggestions" : "Stuck? Use a starter"}
            </button>
            <span
              className={clsx(
                "text-xs tabular-nums",
                remaining < 40 ? "text-petal" : "text-faint",
              )}
            >
              {remaining} left
            </span>
          </div>

          {showStarters ? (
            <ul className="flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(s.text);
                      setShowStarters(false);
                    }}
                    className="rounded-full border border-line-firm px-3 py-1.5 text-xs text-cream-2 transition-colors hover:border-brass hover:text-brass"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {error ? <p className="text-xs text-petal">{error}</p> : null}
        </div>

        {/* the card */}
        <figure className="flex flex-col gap-2">
          <div className="flex aspect-[5/3.4] flex-col justify-between rounded-lg border border-line-firm bg-cream p-4 text-ink shadow-lift">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-[0.7rem] leading-tight text-ink/60">
                {to?.trim() ? `For ${to.trim()}` : " "}
              </p>
              <LocketMark className="h-5 w-auto shrink-0 text-ink/35" />
            </div>

            <p
              className={clsx(
                "font-display leading-snug",
                value.length > 190
                  ? "text-[0.62rem]"
                  : value.length > 100
                    ? "text-[0.74rem]"
                    : "text-[0.9rem]",
              )}
            >
              {value.trim() || (
                <span className="text-ink/35">Your message, written by hand</span>
              )}
            </p>

            <p className="text-right font-display text-[0.7rem] italic text-ink/60">
              {from?.trim() ? `— ${from.trim()}` : " "}
            </p>
          </div>
          <figcaption className="text-xs text-muted">
            Roughly how it'll look. Written out by hand, not printed.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
