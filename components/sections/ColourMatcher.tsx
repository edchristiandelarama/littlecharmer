"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useBuilder } from "@/lib/builder-store";
import {
  isLight,
  nearestWires,
  rgbToHex,
  wire,
} from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * COLOUR MATCHER
 *
 * The one thing a fresh-flower shop can never answer: "can you match this
 * exactly?" Pull a colour from a photo of the gown, the sablay, the team jersey,
 * and it names the closest wires in stock.
 *
 * The photo never leaves the browser — it's drawn to a canvas and sampled
 * locally. Worth saying out loud on the page, because people are reasonably
 * cautious about uploading pictures of themselves.
 * =========================================================================== */

const PRESETS = [
  { label: "Maroon", hex: "#7b1113" },
  { label: "Royal blue", hex: "#1d4ed8" },
  { label: "Emerald", hex: "#046a38" },
  { label: "Blush", hex: "#f2b8c6" },
  { label: "Champagne", hex: "#e6d3a3" },
  { label: "Lavender", hex: "#9b7bd4" },
];

export default function ColourMatcher() {
  const [target, setTarget] = useState("#7b1113");
  const [photo, setPhoto] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setActiveColour = useBuilder((s) => s.setActiveColour);

  const matches = useMemo(() => nearestWires(target, 5), [target]);

  const onFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Cap the working size — a 12MP phone photo doesn't need to be full
      // resolution just to have its colours sampled.
      const max = 900;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setPhoto(url);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, []);

  const sample = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    // Average a small patch rather than a single pixel — one pixel picks up
    // JPEG noise and highlights and gives a colour nobody would recognise.
    const r = 3;
    const size = r * 2 + 1;
    const data = ctx.getImageData(
      Math.max(0, x - r),
      Math.max(0, y - r),
      Math.min(size, canvas.width),
      Math.min(size, canvas.height),
    ).data;

    let sr = 0;
    let sg = 0;
    let sb = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      sr += data[i];
      sg += data[i + 1];
      sb += data[i + 2];
      n++;
    }
    if (n === 0) return;
    setTarget(rgbToHex(sr / n, sg / n, sb / n));
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      {/* --- picking a colour --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="eyebrow">Pick the colour you need</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-inset ring-black/30">
              <span className="sr-only">Choose a colour</span>
              <input
                type="color"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <div className="flex flex-col gap-1">
              <p className="font-display text-2xl uppercase tabular-nums">{target}</p>
              <p className="text-xs text-muted">
                Tap the circle to open your colour picker
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <h3 className="text-xs uppercase tracking-[0.15em] text-faint">
            Or start from a common one
          </h3>
          <ul className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <li key={p.hex}>
                <button
                  type="button"
                  onClick={() => setTarget(p.hex)}
                  className={clsx(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
                    target.toLowerCase() === p.hex
                      ? "border-brass text-brass"
                      : "border-line-firm text-cream-2 hover:border-brass",
                  )}
                >
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/30"
                    style={{ backgroundColor: p.hex }}
                  />
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* --- from a photo --- */}
        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <h3 className="eyebrow">Or pull it out of a photo</h3>
          <p className="text-sm text-cream-2">
            Upload a picture of the gown, the sablay, the uniform — whatever
            you&apos;re matching — then tap the colour in it.
          </p>

          <label className="cursor-pointer self-start rounded-full border border-line-firm px-5 py-2.5 text-sm transition-colors hover:border-brass hover:text-brass">
            {photo ? "Choose a different photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>

          <div className={clsx("flex flex-col gap-2", !photo && "hidden")}>
            <canvas
              ref={canvasRef}
              onClick={sample}
              className="w-full cursor-crosshair rounded-lg border border-line-firm"
            />
            <p className="text-xs text-muted">
              Tap anywhere on the photo to sample it. It stays on your device —
              nothing is uploaded to us.
            </p>
          </div>
        </div>
      </div>

      {/* --- the matches --- */}
      <div className="flex flex-col gap-5">
        <h2 className="eyebrow">Closest wires we stock</h2>

        <ul className="flex flex-col gap-2.5">
          {matches.map((m, i) => (
            <li
              key={m.colour.id}
              className={clsx(
                "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                i === 0 ? "border-brass/50 bg-surface/70" : "border-line bg-surface/40",
              )}
            >
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xs font-semibold ring-1 ring-inset ring-black/30"
                style={{
                  backgroundColor: m.colour.hex,
                  color: isLight(m.colour.hex) ? "#241e2b" : "#f6eff3",
                }}
              >
                {i === 0 ? "Best" : null}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-lg">
                    {m.colour.name}
                  </p>
                  <p className="shrink-0 text-sm text-brass tabular-nums">
                    {m.closeness}% match
                  </p>
                </div>

                {/* a bar is easier to compare at a glance than five percentages */}
                <div className="h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brass transition-[width] duration-500"
                    style={{ width: `${m.closeness}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveColour(m.colour.id)}
                className="shrink-0 rounded-full border border-line-firm px-3 py-1.5 text-xs transition-colors hover:border-petal hover:text-petal"
              >
                Use it
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 rounded-xl border border-line bg-ink p-5">
          <p className="text-sm text-cream-2">
            Picked one? It&apos;s already selected in the builder — go and put a
            bouquet together with it. If nothing here is close enough, send us the
            photo and we&apos;ll tell you honestly whether we can match it.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/build"
              className="rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-bright"
            >
              Open the builder
            </Link>
            <Link
              href={`/order?colour=${encodeURIComponent(target)}`}
              className="rounded-full border border-line-firm px-5 py-2.5 text-sm transition-colors hover:border-petal hover:text-petal"
            >
              Ask us about {wire(matches[0].colour.id).name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
