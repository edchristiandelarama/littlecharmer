"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { craftSteps } from "@/lib/site.config";
import SectionHead from "@/components/ui/SectionHead";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * HOW WE MAKE IT
 *
 * The most convincing section on the site, because nobody drop-shipping these
 * could write it. It holds still while you scroll, stepping through the four
 * stages — worth taking over the scroll here in a way it wouldn't be on the
 * hero, because the whole point is that these steps happen in sequence.
 *
 * On narrow screens it becomes a plain numbered list, which is more usable on a
 * phone than a hijacked scroll.
 * =========================================================================== */

const RAD = Math.PI / 180;

/** A wire bending itself into a petal, drawn per step. */
function StepDiagram({ step, active }: { step: number; active: boolean }) {
  // Each step reveals more of the construction: straight wire → one loop →
  // a bound stem → the finished, wrapped bouquet.
  const petals = [0, 72, 144, 216, 288];

  return (
    <svg
      viewBox="-60 -70 120 140"
      className={clsx(
        "h-full w-auto transition-opacity duration-700",
        active ? "opacity-100" : "opacity-25",
      )}
      aria-hidden
    >
      {/* step 1 — lengths of wire, still straight */}
      <g
        className="transition-opacity duration-700"
        style={{ opacity: step === 0 ? 1 : 0 }}
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      >
        {[-30, -15, 0, 15, 30].map((x, i) => (
          <path key={x} d={`M ${x} ${-44 + i * 3} L ${x} ${40 - i * 2}`} />
        ))}
      </g>

      {/* step 2 — bent into petal loops */}
      <g
        className="transition-opacity duration-700"
        style={{ opacity: step === 1 ? 1 : 0 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        {petals.slice(0, 3).map((deg, i) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-20"
            rx="11"
            ry="20"
            transform={`rotate(${-40 + i * 40})`}
          />
        ))}
        <path d="M0 0 L0 44" strokeLinecap="round" />
      </g>

      {/* step 3 — petals bound onto a wrapped stem */}
      <g
        className="transition-opacity duration-700"
        style={{ opacity: step === 2 ? 1 : 0 }}
      >
        <g fill="none" stroke="currentColor" strokeWidth="2.6">
          {petals.map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-18"
              rx="9"
              ry="18"
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
        <path
          d="M0 2 L0 48"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* the binding */}
        {[8, 14, 20, 26].map((y) => (
          <path
            key={y}
            d={`M -4 ${y} L 4 ${y + 3}`}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        ))}
      </g>

      {/* step 4 — assembled and wrapped */}
      <g
        className="transition-opacity duration-700"
        style={{ opacity: step === 3 ? 1 : 0 }}
      >
        <g fill="currentColor">
          {[
            [0, -30, 1],
            [-24, -20, 0.82],
            [24, -20, 0.82],
            [-13, -38, 0.7],
            [14, -38, 0.7],
          ].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              {petals.map((deg) => (
                <ellipse
                  key={deg}
                  cx="0"
                  cy="-9"
                  rx="5"
                  ry="9"
                  transform={`rotate(${deg})`}
                  opacity="0.9"
                />
              ))}
            </g>
          ))}
        </g>
        <path
          d="M -30 -6 L 30 -6 L 11 52 L -11 52 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <rect
          x="-14"
          y="20"
          width="28"
          height="7"
          rx="3.5"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default function HowWeMakeIt() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  /*
   * The "pin" is CSS `position: sticky`, not a JavaScript one.
   *
   * GSAP's ScrollTrigger pin works by reparenting the pinned element into a
   * generated spacer div. React doesn't know that happened, so when this page
   * unmounts — navigating to /shop or /build — React tries to remove a node
   * that is no longer its child and throws
   * "Failed to execute 'removeChild' on 'Node'".
   *
   * Sticky positioning gets the identical effect without moving a single node,
   * so there is nothing for React and the animation library to disagree about.
   * All this listener does is read the scroll position; it never writes to the
   * DOM structure.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    const read = () => {
      frame = 0;

      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      // 0 when the track's top reaches the viewport top, 1 at its bottom.
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const next = Math.min(
        craftSteps.length - 1,
        Math.floor(progress * craftSteps.length),
      );
      setStep((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    /*
     * Desktop: a tall track (one viewport per step) holding a sticky panel, so
     * the section appears to hold still while the steps advance.
     * Mobile: the track collapses to auto height and the panel stops being
     * sticky, leaving a plain scrollable list — taking over the scroll on a
     * phone to advance four steps is worse than just letting people read.
     */
    <section
      id="process"
      aria-labelledby="process-title"
      className="border-t border-line/60 bg-ink-2"
    >
      <div
        ref={trackRef}
        className="relative lg:h-[400vh] motion-reduce:lg:h-auto"
      >
        <div className="py-20 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0 motion-reduce:lg:static motion-reduce:lg:h-auto motion-reduce:lg:py-20">
          <div className="container-page w-full">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16">
              {/* words */}
              <div className="flex flex-col gap-8">
                <SectionHead
                  id="process-title"
                  eyebrow="How we make it"
                  title={
                    <>
                      There is no machine
                      <br />
                      <em className="text-petal">for this.</em>
                    </>
                  }
                >
                  Four stages, every single stem. A full bouquet is a few hours
                  of bending, twisting and adjusting — which is the part that
                  decides whether it looks handmade or looks cheap.
                </SectionHead>

                {/* On desktop these swap as you scroll; on mobile they're all shown. */}
                <ol className="flex flex-col gap-3">
                  {craftSteps.map((s, i) => {
                    const isActive = i === step;
                    return (
                      <li
                        key={s.step}
                        className={clsx(
                          "rounded-xl border p-5 transition-all duration-500 ease-[var(--ease-out-soft)]",
                          "lg:cursor-default",
                          isActive
                            ? "border-brass/50 bg-surface/70"
                            : "border-line bg-transparent lg:opacity-45",
                        )}
                      >
                        <div className="flex items-baseline gap-3">
                          <span
                            className={clsx(
                              "font-display text-sm tabular-nums transition-colors",
                              isActive ? "text-brass" : "text-faint",
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-display text-xl sm:text-2xl">
                            {s.step}
                          </h3>
                        </div>
                        <p
                          className={clsx(
                            "mt-2 max-w-prose text-sm leading-relaxed transition-all duration-500",
                            isActive
                              ? "text-cream-2"
                              : "text-muted lg:max-h-0 lg:overflow-hidden lg:opacity-0",
                          )}
                        >
                          {s.body}
                        </p>
                        <p
                          className={clsx(
                            "mt-2 text-2xs uppercase tracking-[0.16em] text-brass/80 transition-opacity duration-500",
                            isActive ? "opacity-100" : "opacity-0 lg:hidden",
                          )}
                        >
                          {s.detail}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Your photograph of this stage — or the drawing, until there is one */}
              <div className="relative hidden aspect-square items-center justify-center overflow-hidden rounded-2xl border border-line bg-ink/60 p-12 text-petal lg:flex">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(60% 50% at 50% 42%, rgba(238,155,174,0.12), transparent 70%)",
                  }}
                />

                {/*
                  Every photo stays mounted and cross-fades. Swapping a single
                  src instead would re-request the image on each step change and
                  flash empty in the gap.
                */}
                {craftSteps.map((s, i) =>
                  s.photo ? (
                    <Image
                      key={s.step}
                      src={s.photo}
                      alt={`${s.step} — ${s.detail}`}
                      fill
                      sizes="(min-width: 1024px) 40vw, 0px"
                      className={clsx(
                        "absolute inset-0 object-cover transition-opacity duration-700",
                        i === step ? "opacity-100" : "opacity-0",
                      )}
                    />
                  ) : null,
                )}

                {craftSteps[step]?.photo ? null : (
                  <StepDiagram step={step} active />
                )}

                {/* progress pips */}
                <ol className="absolute bottom-6 flex gap-2" aria-hidden>
                  {craftSteps.map((s, i) => (
                    <li
                      key={s.step}
                      className={clsx(
                        "h-1 rounded-full transition-all duration-500",
                        i === step ? "w-8 bg-brass" : "w-3 bg-line-firm",
                      )}
                    />
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
