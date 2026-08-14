"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { MaterialsContent, ProductsContent } from "@/lib/content-schema";
import type { FlowerShape } from "@/lib/flowers";
import { formatPeso } from "@/lib/products";
import { wire } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

const FlowerPreview = dynamic(() => import("./FlowerPreview"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-xs text-faint">
      Loading preview…
    </div>
  ),
});

/* ===========================================================================
 * FLOWER SHAPES
 *
 * The shapes you make, their prices, and the dimensions the 3D flower is built
 * from. Those dimensions are meaningless as bare numbers, so every one of them
 * has a slider and a live preview beside it — drag and watch.
 * =========================================================================== */

type Shape = MaterialsContent["flowerShapes"][number];
type Colour = MaterialsContent["wireColours"][number];

const input =
  "w-full rounded-lg border border-line-firm bg-surface px-3 py-2 text-cream placeholder:text-faint focus:border-brass";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** One geometry control: a slider, a readout, and a plain-language label. */
function Dial({
  label,
  hint,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-cream-2">{label}</span>
        <span className="text-xs tabular-nums text-brass">
          {value}
          {suffix ?? ""}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brass"
      />
      <span className="text-2xs leading-snug text-faint">{hint}</span>
    </label>
  );
}

export default function FlowersTab({
  shapes,
  colours,
  products,
  onChange,
}: {
  shapes: Shape[];
  colours: Colour[];
  products: ProductsContent["products"];
  onChange: (next: Shape[]) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const s of p.stems) counts.set(s.shape, (counts.get(s.shape) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const update = (i: number, patch: Partial<Shape>) =>
    onChange(shapes.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const updateGeometry = (i: number, patch: Partial<Shape["geometry"]>) =>
    onChange(
      shapes.map((s, j) =>
        j === i ? { ...s, geometry: { ...s.geometry, ...patch } } : s,
      ),
    );

  const add = () => {
    const n = shapes.length + 1;
    onChange([
      ...shapes,
      {
        id: `new-shape-${n}`,
        name: `New shape ${n}`,
        blurb: "",
        price: 100,
        effort: "about 15 minutes each",
        defaultColour: colours[0]?.id ?? "blush",
        geometry: {
          petals: 8,
          layers: 2,
          petalLength: 0.5,
          petalWidth: 0.25,
          wireRadius: 0.032,
          openness: 45,
          layerTwist: 20,
          centre: 0.06,
          centreColour: "",
          stemLength: 2.5,
        },
      },
    ]);
    setOpenIndex(shapes.length);
  };

  const remove = (i: number) => {
    if (shapes.length <= 1) {
      window.alert("You need at least one shape.");
      return;
    }
    const s = shapes[i];
    const used = usage.get(s.id) ?? 0;
    const warning = used
      ? `"${s.name}" is used in ${used} product${used === 1 ? "" : "s"}. Those will fall back to another shape. Delete anyway?`
      : `Delete "${s.name}"?`;
    if (window.confirm(warning)) {
      onChange(shapes.filter((_, j) => j !== i));
      setOpenIndex(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs text-muted">
          {shapes.length} shapes. Drag any slider and the preview rebuilds — it
          really is the flower customers will see.
        </p>
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-dashed border-line-firm px-4 py-2 text-sm text-cream-2 hover:border-brass hover:text-brass"
        >
          + Add a shape
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {shapes.map((s, i) => {
          const open = openIndex === i;
          const used = usage.get(s.id) ?? 0;
          const previewColour = s.defaultColour || colours[0]?.id || "blush";

          return (
            <li
              key={i}
              className={clsx(
                "rounded-xl border transition-colors",
                open ? "border-brass/50 bg-surface/60" : "border-line bg-surface/30",
              )}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    aria-hidden
                    className="h-8 w-8 shrink-0 rounded-full ring-1 ring-inset ring-black/30"
                    style={{ backgroundColor: wire(previewColour).hex }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg">
                      {s.name || "Untitled"}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {formatPeso(s.price)} per stem · {s.geometry.petals} petals ·{" "}
                      {used ? `used in ${used} product${used === 1 ? "" : "s"}` : "unused"}
                    </span>
                  </span>
                  <span aria-hidden className="text-faint">
                    {open ? "▾" : "▸"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
                >
                  <span className="sr-only">{`Delete ${s.name}`}</span>
                  <span aria-hidden>×</span>
                </button>
              </div>

              {open ? (
                <div className="grid gap-6 border-t border-line px-4 pb-5 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
                  {/* fields */}
                  <div className="flex flex-col gap-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                        Name
                        <input
                          className={input}
                          value={s.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            const auto = s.id.startsWith("new-shape");
                            update(i, auto ? { name, id: slugify(name) } : { name });
                          }}
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                        Price per stem (₱)
                        <input
                          type="number"
                          min={0}
                          className={input}
                          value={s.price}
                          onChange={(e) =>
                            update(i, { price: Number(e.target.value) || 0 })
                          }
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                      <span>
                        Description
                        <span className="ml-2 text-xs text-faint">
                          shown under the shape in the builder
                        </span>
                      </span>
                      <input
                        className={input}
                        value={s.blurb}
                        onChange={(e) => update(i, { blurb: e.target.value })}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                        <span>
                          How long it takes
                          <span className="ml-2 text-xs text-faint">be honest</span>
                        </span>
                        <input
                          className={input}
                          value={s.effort}
                          onChange={(e) => update(i, { effort: e.target.value })}
                        />
                      </label>

                      <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                        Usual colour
                        <select
                          className={input}
                          value={s.defaultColour}
                          onChange={(e) =>
                            update(i, { defaultColour: e.target.value })
                          }
                        >
                          {colours.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* geometry */}
                    <div className="flex flex-col gap-4 border-t border-line pt-4">
                      <div>
                        <h4 className="eyebrow">Shape of the flower</h4>
                        <p className="mt-1 text-2xs text-faint">
                          Every petal is one length of wire bent into a loop, so
                          these are the same decisions you make at the table.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Dial
                          label="Petals"
                          hint="How many loops of wire in one flower"
                          value={s.geometry.petals}
                          min={1}
                          max={40}
                          step={1}
                          onChange={(petals) => updateGeometry(i, { petals })}
                        />
                        <Dial
                          label="Rows of petals"
                          hint="1 is flat like a daisy; 3 makes a full rose"
                          value={s.geometry.layers}
                          min={1}
                          max={5}
                          step={1}
                          onChange={(layers) => updateGeometry(i, { layers })}
                        />
                        <Dial
                          label="How open"
                          hint="0 is a closed bud, 90 lies flat like a daisy"
                          value={s.geometry.openness}
                          min={0}
                          max={90}
                          step={1}
                          suffix="°"
                          onChange={(openness) => updateGeometry(i, { openness })}
                        />
                        <Dial
                          label="Twist between rows"
                          hint="Offsets each row so petals sit in the gaps"
                          value={s.geometry.layerTwist}
                          min={0}
                          max={90}
                          step={1}
                          suffix="°"
                          onChange={(layerTwist) => updateGeometry(i, { layerTwist })}
                        />
                        <Dial
                          label="Petal length"
                          hint="How far each loop reaches out"
                          value={s.geometry.petalLength}
                          min={0.1}
                          max={1.2}
                          step={0.01}
                          onChange={(petalLength) =>
                            updateGeometry(i, { petalLength })
                          }
                        />
                        <Dial
                          label="Petal width"
                          hint="Narrow for daisies, wide for roses"
                          value={s.geometry.petalWidth}
                          min={0.05}
                          max={0.7}
                          step={0.01}
                          onChange={(petalWidth) => updateGeometry(i, { petalWidth })}
                        />
                        <Dial
                          label="Wire thickness"
                          hint="Thicker wire reads as chunkier chenille"
                          value={s.geometry.wireRadius}
                          min={0.01}
                          max={0.08}
                          step={0.001}
                          onChange={(wireRadius) => updateGeometry(i, { wireRadius })}
                        />
                        <Dial
                          label="Centre size"
                          hint="0 for none; big for a sunflower's seeded middle"
                          value={s.geometry.centre}
                          min={0}
                          max={0.5}
                          step={0.01}
                          onChange={(centre) => updateGeometry(i, { centre })}
                        />
                        <Dial
                          label="Stem length"
                          hint="Shorter stems sit lower in the wrap"
                          value={s.geometry.stemLength}
                          min={1}
                          max={4}
                          step={0.05}
                          onChange={(stemLength) => updateGeometry(i, { stemLength })}
                        />

                        <label className="flex flex-col gap-1.5 text-sm text-cream-2">
                          <span>Centre colour</span>
                          <select
                            className={input}
                            value={s.geometry.centreColour ?? ""}
                            onChange={(e) =>
                              updateGeometry(i, { centreColour: e.target.value })
                            }
                          >
                            <option value="">Same as the petals</option>
                            {colours.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <span className="text-2xs text-faint">
                            Only shows when the centre size is above zero
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* live preview */}
                  <div className="flex flex-col gap-2 lg:sticky lg:top-4 lg:self-start">
                    <h4 className="eyebrow">Live preview</h4>
                    <div className="aspect-square overflow-hidden rounded-xl border border-line bg-ink-2">
                      <FlowerPreview
                        shape={s as unknown as FlowerShape}
                        colour={previewColour}
                      />
                    </div>
                    <p className="text-2xs text-faint">
                      Shown in {wire(previewColour).name}. This is the real 3D
                      flower, not a mock-up.
                    </p>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
