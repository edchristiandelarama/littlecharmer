"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCapabilities } from "@/lib/use-capabilities";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import { site } from "@/lib/site.config";
import { HERO_BUILD } from "./hero-build";

/* WebGL never blocks first paint: the canvas is loaded on the client only,
   after the static hero is already on screen. */
const HeroStage = dynamic(() => import("./HeroStage"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  const caps = useCapabilities();

  return (
    <section className="relative isolate overflow-hidden">
      {/* the glow the bouquet sits in */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 68% 42%, rgba(238,155,174,0.16), transparent 62%), radial-gradient(50% 45% at 20% 18%, rgba(217,180,120,0.12), transparent 60%)",
        }}
      />

      <div className="container-page grid min-h-[88svh] items-center gap-8 py-16 lg:min-h-[92svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-4 lg:py-20">
        {/* --- the words --- */}
        <div className="relative z-10 flex flex-col items-start gap-6 lg:pr-6">
          <p className="eyebrow animate-[fade-up_0.8s_var(--ease-out-soft)_both]">
            Handmade in {site.location.city} · Ships nationwide
          </p>

          <h1 className="text-[clamp(2.9rem,1.6rem+5.4vw,5.4rem)] leading-[0.94] animate-[fade-up_0.9s_var(--ease-out-soft)_0.1s_both]">
            Flowers that
            <br />
            <em className="text-petal">never wilt.</em>
          </h1>

          <p className="max-w-[46ch] text-lg text-cream-2 animate-[fade-up_0.9s_var(--ease-out-soft)_0.2s_both]">
            Bouquets bent by hand from fuzzy wire, one petal at a time, in any
            colour you can name. No water, no dropping petals — still on the
            shelf in ten years.
          </p>

          <div className="flex flex-wrap items-center gap-3 animate-[fade-up_0.9s_var(--ease-out-soft)_0.3s_both]">
            <Link
              href="/shop"
              className="rounded-full bg-brass px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-brass-bright"
            >
              See the shop
            </Link>
            <Link
              href="/build"
              className="rounded-full border border-line-firm px-7 py-3.5 font-semibold text-cream transition-colors hover:border-petal hover:text-petal"
            >
              Build your own
            </Link>
          </div>

          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3 animate-[fade-up_0.9s_var(--ease-out-soft)_0.4s_both]">
            {[
              { v: "40+", k: "wire shades in stock" },
              { v: "0", k: "flowers that wilt" },
              { v: "Made", k: "to order, by hand" },
            ].map((s) => (
              <div key={s.k} className="flex flex-col">
                <dt className="sr-only">{s.k}</dt>
                <dd className="font-display text-2xl text-brass">{s.v}</dd>
                <dd className="max-w-[14ch] text-xs leading-snug text-muted">
                  {s.k}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* --- the bouquet --- */}
        <div className="relative order-first h-[46svh] min-h-[300px] w-full lg:order-none lg:h-[78svh]">
          {caps.ready && caps.render3D ? (
            <HeroStage quality={caps.quality} fuzz={caps.fuzz} />
          ) : (
            /* Shown during SSR and first paint, and permanently for anyone on
               reduced motion, a saver connection, or a device without WebGL. */
            <div className="grid h-full place-items-center">
              <BouquetSvg
                stems={HERO_BUILD.stems}
                wrapHex="#b08a5e"
                ribbonHex="#c9a227"
                title="A Little Charmer bouquet of handmade fuzzy wire flowers"
                className="h-full w-auto max-w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
        <span className="eyebrow flex items-center gap-2 text-faint">
          Scroll
          <svg viewBox="0 0 12 20" className="h-4 w-2.5" fill="none" aria-hidden>
            <path
              d="M6 1v17m0 0l-4-4m4 4l4-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </section>
  );
}
