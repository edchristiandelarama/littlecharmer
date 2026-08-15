"use client";

import { useMemo } from "react";
import type { MaterialsContent, ProductsContent } from "@/lib/content-schema";
import { isLight } from "@/lib/wire-colours";
import { formatPeso } from "@/lib/products";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * WIRE COLOURS, WRAPS AND RIBBONS
 *
 * Everything on the shelf that has a colour. Wire drives the builder, the shop
 * filter, the colour matcher and every product's colour dots — accuracy matters
 * far more than prettiness here. A customer who picks "Ruby" and receives
 * something else will notice.
 *
 * Best way to fill this in: photograph your stock in daylight and use your
 * phone's eyedropper on each one.
 * =========================================================================== */

type Colour = MaterialsContent["wireColours"][number];
type Wrap = MaterialsContent["wraps"][number];
type Ribbon = MaterialsContent["ribbons"][number];

const input =
  "w-full rounded-lg border border-line-firm bg-surface px-3 py-2 text-cream placeholder:text-faint focus:border-brass";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** A round swatch that opens the colour picker when clicked. */
function Swatch({
  hex,
  metallic,
  label,
  onChange,
}: {
  hex: string;
  metallic?: boolean;
  label: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label
      className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-inset ring-black/30"
      style={{ backgroundColor: hex }}
      title="Click to pick a colour"
    >
      <span className="sr-only">{label}</span>
      {metallic ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/55 to-transparent"
        />
      ) : null}
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] cursor-pointer border-0 bg-transparent p-0"
      />
    </label>
  );
}

export default function ColoursTab({
  colours,
  wraps,
  ribbons,
  products,
  shapes,
  onChangeColours,
  onChangeWraps,
  onChangeRibbons,
}: {
  colours: Colour[];
  wraps: Wrap[];
  ribbons: Ribbon[];
  products: ProductsContent["products"];
  shapes: MaterialsContent["flowerShapes"];
  onChangeColours: (next: Colour[]) => void;
  onChangeWraps: (next: Wrap[]) => void;
  onChangeRibbons: (next: Ribbon[]) => void;
}) {
  /*
   * How many places each wire colour is used. Deleting one in use doesn't
   * crash anything — lookups fall back — but those products would quietly
   * change colour, so it's worth showing before it happens.
   */
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const s of p.stems) counts.set(s.colour, (counts.get(s.colour) ?? 0) + 1);
    }
    for (const s of shapes) {
      if (s.defaultColour)
        counts.set(s.defaultColour, (counts.get(s.defaultColour) ?? 0) + 1);
      if (s.geometry.centreColour)
        counts.set(
          s.geometry.centreColour,
          (counts.get(s.geometry.centreColour) ?? 0) + 1,
        );
    }
    return counts;
  }, [products, shapes]);

  const update = (i: number, patch: Partial<Colour>) =>
    onChangeColours(colours.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const addColour = () => {
    const n = colours.length + 1;
    onChangeColours([
      ...colours,
      {
        id: `new-colour-${n}`,
        name: `New colour ${n}`,
        hex: "#cccccc",
        metallic: false,
        inStock: true,
      },
    ]);
  };

  const removeColour = (i: number) => {
    const c = colours[i];
    const used = usage.get(c.id) ?? 0;
    const warning = used
      ? `"${c.name}" is used in ${used} place${used === 1 ? "" : "s"}. Those will fall back to another colour. Delete anyway?`
      : `Delete "${c.name}"?`;
    if (window.confirm(warning)) onChangeColours(colours.filter((_, j) => j !== i));
  };

  const outOfStock = colours.filter((c) => c.inStock === false).length;

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------ wire ------------------------------ */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="eyebrow">Wire colours</h3>
            <p className="text-xs text-muted">
              {colours.length} colours
              {outOfStock ? `, ${outOfStock} out of stock` : ""}. Untick{" "}
              <em>In stock</em> when you run out — it stays on the site, dimmed
              and labelled, which answers the question before it&apos;s asked.
            </p>
          </div>
          <button
            type="button"
            onClick={addColour}
            className="rounded-full border border-dashed border-line-firm px-4 py-1.5 text-sm text-cream-2 hover:border-brass hover:text-brass"
          >
            + Add a colour
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {colours.map((c, i) => {
            const used = usage.get(c.id) ?? 0;
            return (
              <li
                key={i}
                className={clsx(
                  "flex flex-wrap items-center gap-3 rounded-xl border border-line p-3",
                  c.inStock === false ? "bg-surface/20 opacity-70" : "bg-surface/40",
                )}
              >
                <Swatch
                  hex={c.hex}
                  metallic={c.metallic}
                  label={`Colour for ${c.name}`}
                  onChange={(hex) => update(i, { hex })}
                />

                <input
                  aria-label="Colour name"
                  className={clsx(input, "w-auto min-w-40 flex-1")}
                  value={c.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const auto = c.id.startsWith("new-colour");
                    update(i, auto ? { name, id: slugify(name) } : { name });
                  }}
                />

                <input
                  aria-label="Hex code"
                  className={clsx(input, "w-28 font-mono text-xs uppercase")}
                  value={c.hex}
                  onChange={(e) => {
                    const v = e.target.value.startsWith("#")
                      ? e.target.value
                      : `#${e.target.value}`;
                    update(i, { hex: v.slice(0, 7) });
                  }}
                />

                <label className="flex items-center gap-1.5 text-xs text-cream-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brass"
                    checked={Boolean(c.metallic)}
                    onChange={(e) => update(i, { metallic: e.target.checked })}
                  />
                  Metallic
                </label>

                <label className="flex items-center gap-1.5 text-xs text-cream-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brass"
                    checked={c.inStock !== false}
                    onChange={(e) => update(i, { inStock: e.target.checked })}
                  />
                  In stock
                </label>

                <span
                  className="shrink-0 text-2xs tabular-nums text-faint"
                  title="How many products and shapes use this colour"
                >
                  {used ? `used ${used}×` : "unused"}
                </span>

                <button
                  type="button"
                  onClick={() => removeColour(i)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
                >
                  <span className="sr-only">{`Delete ${c.name}`}</span>
                  <span aria-hidden>×</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <h4 className="text-xs uppercase tracking-[0.15em] text-faint">
            The whole shelf
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {colours.map((c) => (
              <li
                key={c.id}
                title={`${c.name}${c.inStock === false ? " — out of stock" : ""}`}
                className={clsx(
                  "grid h-9 w-9 place-items-center rounded-full text-2xs ring-1 ring-inset ring-black/30",
                  c.inStock === false && "opacity-30",
                )}
                style={{
                  backgroundColor: c.hex,
                  color: isLight(c.hex) ? "#241e2b" : "#f6eff3",
                }}
              >
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --------------------------- wrap colours -------------------------- */}
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <div className="flex flex-col gap-1">
          <h3 className="eyebrow">Wrap colours</h3>
          <p className="text-xs text-muted">
            Up to five, each with its own price. Customers choose a wrap by
            colour rather than by paper type.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {wraps.map((w, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface/40 p-3"
            >
              <Swatch
                hex={w.hex}
                label={`Colour for ${w.name}`}
                onChange={(hex) =>
                  onChangeWraps(
                    wraps.map((x, j) => (j === i ? { ...x, hex } : x)),
                  )
                }
              />
              <input
                aria-label="Wrap name"
                className={clsx(input, "w-auto min-w-40 flex-1")}
                value={w.name}
                onChange={(e) =>
                  onChangeWraps(
                    wraps.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            name: e.target.value,
                            id: x.id.startsWith("new-wrap")
                              ? slugify(e.target.value)
                              : x.id,
                          }
                        : x,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-2 text-xs text-muted">
                ₱
                <input
                  type="number"
                  min={0}
                  aria-label="Wrap price"
                  className={clsx(input, "w-24")}
                  value={w.price}
                  onChange={(e) =>
                    onChangeWraps(
                      wraps.map((x, j) =>
                        j === i ? { ...x, price: Number(e.target.value) || 0 } : x,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => onChangeWraps(wraps.filter((_, j) => j !== i))}
                disabled={wraps.length <= 1}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal disabled:opacity-30"
              >
                <span className="sr-only">{`Delete ${w.name}`}</span>
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>

        {true ? (
          <button
            type="button"
            onClick={() =>
              onChangeWraps([
                ...wraps,
                {
                  id: `new-wrap-${wraps.length + 1}`,
                  name: "New wrap",
                  hex: "#b08a5e",
                  price: 100,
                },
              ])
            }
            className="self-start rounded-full border border-dashed border-line-firm px-4 py-1.5 text-sm text-cream-2 hover:border-brass hover:text-brass"
          >
            + Add a wrap colour
          </button>
        ) : (
          <p className="text-2xs text-faint">Five is the maximum.</p>
        )}
      </section>

      {/* -------------------------- ribbon colours ------------------------- */}
      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <div className="flex flex-col gap-1">
          <h3 className="eyebrow">Ribbon colours</h3>
          <p className="text-xs text-muted">
            Same idea — a colour and a price each.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {ribbons.map((r, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface/40 p-3"
            >
              <Swatch
                hex={r.hex}
                label={`Colour for ${r.name}`}
                onChange={(hex) =>
                  onChangeRibbons(
                    ribbons.map((x, j) => (j === i ? { ...x, hex } : x)),
                  )
                }
              />
              <input
                aria-label="Ribbon name"
                className={clsx(input, "w-auto min-w-40 flex-1")}
                value={r.name}
                onChange={(e) =>
                  onChangeRibbons(
                    ribbons.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            name: e.target.value,
                            id: x.id.startsWith("new-ribbon")
                              ? slugify(e.target.value)
                              : x.id,
                          }
                        : x,
                    ),
                  )
                }
              />
              <label className="flex items-center gap-2 text-xs text-muted">
                ₱
                <input
                  type="number"
                  min={0}
                  aria-label="Ribbon price"
                  className={clsx(input, "w-24")}
                  value={r.price}
                  onChange={(e) =>
                    onChangeRibbons(
                      ribbons.map((x, j) =>
                        j === i ? { ...x, price: Number(e.target.value) || 0 } : x,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => onChangeRibbons(ribbons.filter((_, j) => j !== i))}
                disabled={ribbons.length <= 1}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal disabled:opacity-30"
              >
                <span className="sr-only">{`Delete ${r.name}`}</span>
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>

        {true ? (
          <button
            type="button"
            onClick={() =>
              onChangeRibbons([
                ...ribbons,
                {
                  id: `new-ribbon-${ribbons.length + 1}`,
                  name: "New ribbon",
                  hex: "#c9a227",
                  price: 40,
                },
              ])
            }
            className="self-start rounded-full border border-dashed border-line-firm px-4 py-1.5 text-sm text-cream-2 hover:border-brass hover:text-brass"
          >
            + Add a ribbon colour
          </button>
        ) : null}

        <p className="mt-1 text-2xs text-faint">
          Prices here feed the builder&apos;s estimate — {formatPeso(0)} is fine
          for anything you include free.
        </p>
      </section>
    </div>
  );
}
