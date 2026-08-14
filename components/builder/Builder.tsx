"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBuilder } from "@/lib/builder-store";
import { useCapabilities } from "@/lib/use-capabilities";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import {
  flowerShapes,
  ribbonById,
  ribbons,
  shape as shapeDef,
  wrapById,
  wraps,
} from "@/lib/flowers";
import {
  isInStock,
  wire,
  wireFamilies,
  wiresInFamily,
  type WireFamily,
} from "@/lib/wire-colours";
import {
  MAX_STEMS,
  buildStemCount,
  buildTotal,
  decodeBuild,
  encodeBuild,
} from "@/lib/build-encode";
import { formatPeso } from "@/lib/products";
import clsx from "@/lib/clsx";

const BuilderStage = dynamic(() => import("./BuilderStage"), {
  ssr: false,
  loading: () => null,
});

/* ===========================================================================
 * THE BOUQUET BUILDER
 *
 * Three panes on a desktop, stacked on a phone. It ends in an order request
 * rather than a checkout, which matches how the shop actually sells — nothing
 * is priced finally until a human has looked at it.
 * =========================================================================== */

export default function Builder() {
  const params = useSearchParams();
  const caps = useCapabilities();

  const {
    build,
    activeShape,
    activeColour,
    hydrated,
    setActiveShape,
    setActiveColour,
    addActive,
    setQty,
    removeGroup,
    setWrap,
    setRibbon,
    setName,
    load,
    reset,
    surprise,
  } = useBuilder();

  const [family, setFamily] = useState<WireFamily>("pink");
  const [copied, setCopied] = useState(false);

  // A shared link wins over the starter bouquet, but only on first load.
  useEffect(() => {
    if (hydrated) return;
    const shared = decodeBuild(params.get("b"));
    if (shared) load(shared);
  }, [params, hydrated, load]);

  const encoded = useMemo(() => encodeBuild(build), [build]);
  const total = buildTotal(build);
  const stems = buildStemCount(build);
  const full = stems >= MAX_STEMS;

  const share = async () => {
    const url = `${window.location.origin}/build?b=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard is blocked in some in-app browsers; put it in the address
      // bar instead so it can at least be copied by hand.
      window.prompt("Copy your bouquet link:", url);
    }
  };

  return (
    /*
     * On a desktop this is a fixed-height tool, not a tall page section: the
     * three panes each scroll on their own inside it.
     *
     * That's the only way the whole thing stays usable. Left to grow, every
     * pane stretches to match the tallest — the summary, once a bouquet has a
     * few kinds of stem in it — and the builder ends up over 2000px tall, so
     * the 3D stage scrolls out of view while you're picking colours and the
     * Add button sits permanently below the fold.
     *
     * On a phone it goes back to a normal stacked, page-scrolling layout.
     */
    <div className="grid gap-px overflow-hidden rounded-xl border border-line-firm bg-line-firm lg:h-[min(44rem,calc(100vh-8rem))] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* ================= PANE 1 — shape, then colour ================= */}
      {/* data-lenis-prevent: Lenis reads the wheel and scrolls the PAGE itself,
          so without this an inner scroll area never receives the wheel at all. */}
      <div
        data-lenis-prevent
        className="flex min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain bg-ink p-5 sm:p-6"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="eyebrow">Step 1 · Shape</h2>
            <span className="text-2xs uppercase tracking-widest text-faint">
              {stems}/{MAX_STEMS} stems
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {flowerShapes.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveShape(f.id)}
                aria-pressed={activeShape === f.id}
                title={f.blurb}
                className={clsx(
                  "rounded-full border px-3.5 py-2 text-sm transition-colors",
                  activeShape === f.id
                    ? "border-brass bg-brass text-ink"
                    : "border-line-firm text-cream-2 hover:border-brass hover:text-brass",
                )}
              >
                {f.name}
                <span className="ml-1.5 text-2xs opacity-70 tabular-nums">
                  {formatPeso(f.price)}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">{shapeDef(activeShape).blurb}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <h2 className="eyebrow">Step 2 · Colour</h2>

          {/* This is the point of the whole shop: every shape, every colour. */}
          <div className="flex flex-wrap gap-1.5">
            {wireFamilies.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFamily(f.id)}
                aria-pressed={family === f.id}
                className={clsx(
                  "rounded-full px-2.5 py-1 text-2xs uppercase tracking-widest transition-colors",
                  family === f.id
                    ? "bg-surface-2 text-cream"
                    : "text-faint hover:text-cream-2",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ul className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-6">
            {wiresInFamily(family).map((c) => {
              const selected = activeColour === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveColour(c.id)}
                    aria-pressed={selected}
                    title={`${c.name}${isInStock(c) ? "" : " — out of stock"}`}
                    className={clsx(
                      "relative grid aspect-square w-full place-items-center rounded-full ring-1 ring-inset ring-black/30 transition-transform",
                      selected
                        ? "scale-110 outline outline-2 outline-offset-2 outline-brass"
                        : "hover:scale-105",
                      !isInStock(c) && "opacity-35",
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="sr-only">{c.name}</span>
                    {c.metallic ? (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/55 to-transparent"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-muted">
            {wire(activeColour).name}
            {wire(activeColour).metallic ? " · metallic" : ""} ·{" "}
            <Link href="/colour-matcher" className="text-brass hover:underline">
              match a photo instead
            </Link>
          </p>
        </div>

        {/*
          Sticks to the bottom of its own pane. The pane is the scroll container
          now, which is what makes sticky work here — it wouldn't have while the
          builder's `overflow-hidden` root was the nearest scrollable ancestor.
        */}
        <div className="sticky bottom-0 z-10 mt-auto flex flex-col gap-1.5 bg-ink pb-1 pt-3">
          <button
            type="button"
            onClick={() => addActive(1)}
            disabled={full}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold transition-colors",
              full
                ? "cursor-not-allowed bg-surface text-faint"
                : "bg-petal text-ink shadow-glow hover:bg-petal-bright",
            )}
          >
            {full ? (
              "That's a full bouquet"
            ) : (
              <>
                <span
                  aria-hidden
                  className="grid h-5 w-5 place-items-center rounded-full bg-ink/15 text-sm leading-none"
                >
                  +
                </span>
                Add {shapeDef(activeShape).name.toLowerCase()} in{" "}
                {wire(activeColour).name}
              </>
            )}
          </button>

          <p className="text-center text-2xs text-faint">
            Add as many as you like — adjust the numbers on the right.
          </p>
        </div>
      </div>

      {/* ================= PANE 2 — the stage ================= */}
      <div className="relative min-h-[380px] bg-ink-2 lg:min-h-0">
        {caps.ready && caps.render3D ? (
          <>
            <BuilderStage
              build={build}
              quality={caps.quality}
              fuzz={caps.fuzz}
            />
            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-2xs uppercase tracking-[0.18em] text-faint">
              Drag to spin · scroll to zoom
            </p>
          </>
        ) : (
          <div className="grid h-full place-items-center p-8">
            <BouquetSvg
              stems={build.stems}
              wrapHex={wrapById(build.wrap).hex}
              ribbonHex={ribbonById(build.ribbon).hex}
              showWrap={build.wrap !== "none"}
              title="Your bouquet"
              className="h-full max-h-[460px] w-auto"
            />
          </div>
        )}

        {build.stems.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p className="max-w-[24ch] text-center font-display text-2xl text-faint">
              Pick a shape and a colour to start
            </p>
          </div>
        ) : null}
      </div>

      {/* ================= PANE 3 — summary ================= */}
      <div
        data-lenis-prevent
        className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain bg-ink p-5 sm:p-6"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="eyebrow">Your bouquet</h2>
          <div className="flex gap-3 text-2xs uppercase tracking-widest">
            <button
              type="button"
              onClick={() =>
                surprise(build.stems.length * 977 + stems * 31 + 7)
              }
              className="text-brass hover:underline"
            >
              Surprise me
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-faint hover:text-cream-2"
            >
              Start over
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-2">
          {build.stems.map((s, i) => (
            <li
              key={`${s.shape}-${s.colour}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface/50 px-3 py-2.5"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full ring-1 ring-inset ring-black/30"
                style={{ backgroundColor: wire(s.colour).hex }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {shapeDef(s.shape).name}
                <span className="text-muted"> · {wire(s.colour).name}</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQty(i, s.qty - 1)}
                  className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 transition-colors hover:border-petal hover:text-petal"
                >
                  <span className="sr-only">
                    One fewer {shapeDef(s.shape).name}
                  </span>
                  <span aria-hidden>−</span>
                </button>
                <span className="w-6 text-center text-sm tabular-nums">
                  {s.qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(i, s.qty + 1)}
                  disabled={full}
                  className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 transition-colors hover:border-petal hover:text-petal disabled:opacity-35"
                >
                  <span className="sr-only">
                    One more {shapeDef(s.shape).name}
                  </span>
                  <span aria-hidden>+</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(i)}
                  className="ml-1 grid h-7 w-7 place-items-center rounded-full text-faint transition-colors hover:text-petal"
                >
                  <span className="sr-only">
                    Remove all {shapeDef(s.shape).name}
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 4l8 8M12 4l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}

          {build.stems.length === 0 ? (
            <li className="rounded-lg border border-dashed border-line-firm px-3 py-6 text-center text-sm text-faint">
              Nothing added yet
            </li>
          ) : null}
        </ul>

        {/* finishing */}
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <h3 className="eyebrow">Step 3 · Finish</h3>

          <label className="flex flex-col gap-1.5 text-xs text-muted">
            Wrap
            <select
              value={build.wrap}
              onChange={(e) => setWrap(e.target.value)}
              className="rounded-lg border border-line-firm bg-surface px-3 py-2.5 text-sm text-cream"
            >
              {wraps.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {w.price === 0 ? "free" : formatPeso(w.price)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-muted">
            Ribbon
            <select
              value={build.ribbon}
              onChange={(e) => setRibbon(e.target.value)}
              className="rounded-lg border border-line-firm bg-surface px-3 py-2.5 text-sm text-cream"
            >
              {ribbons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {formatPeso(r.price)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-muted">
            Name it (optional)
            <input
              type="text"
              value={build.name ?? ""}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="For Mama, 60th"
              className="rounded-lg border border-line-firm bg-surface px-3 py-2.5 text-sm text-cream placeholder:text-faint"
            />
          </label>
        </div>

        {/* total + actions */}
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-lg">Estimate</span>
            <span className="font-display text-2xl text-brass tabular-nums">
              {formatPeso(total)}
            </span>
          </div>
          <p className="text-xs text-muted">
            An estimate, not a final price — we'll confirm it, along with
            timing, when we reply.
          </p>

          <Link
            href={`/order?build=${encoded}`}
            className={clsx(
              "rounded-full px-6 py-3.5 text-center font-semibold transition-colors",
              build.stems.length === 0
                ? "pointer-events-none bg-surface text-faint"
                : "bg-brass text-ink hover:bg-brass-bright",
            )}
            aria-disabled={build.stems.length === 0}
          >
            Order this bouquet
          </Link>

          <button
            type="button"
            onClick={share}
            disabled={build.stems.length === 0}
            className="rounded-full border border-line-firm px-6 py-3 text-sm transition-colors hover:border-petal hover:text-petal disabled:opacity-40"
          >
            {copied ? "Link copied" : "Copy a link to this bouquet"}
          </button>
        </div>
      </div>
    </div>
  );
}
