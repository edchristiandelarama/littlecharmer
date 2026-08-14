"use client";

import { useMemo, useState } from "react";
import type { MaterialsContent, ProductsContent } from "@/lib/content-schema";
import { wireFamilies, isLight, type WireFamily } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * WIRE COLOURS
 *
 * Your actual chenille stock. These drive the builder's colour picker, the shop
 * colour filter, the colour matcher and every product's colour dots — so
 * accuracy matters more than prettiness. A customer who picks "Ruby" here and
 * receives something else will notice.
 *
 * The best way to fill this in: photograph your wire in daylight, then use the
 * eyedropper in any photo app on each colour.
 * =========================================================================== */

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

export default function ColoursTab({
  colours,
  products,
  shapes,
  onChange,
}: {
  colours: Colour[];
  products: ProductsContent["products"];
  shapes: MaterialsContent["flowerShapes"];
  onChange: (next: Colour[]) => void;
}) {
  const [family, setFamily] = useState<WireFamily | "all">("all");

  /*
   * How many places each colour is used. Deleting one that's in use doesn't
   * crash anything — lookups fall back — but those products would quietly
   * change colour, so it's worth showing before it happens.
   */
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      for (const s of p.stems) {
        counts.set(s.colour, (counts.get(s.colour) ?? 0) + 1);
      }
    }
    for (const s of shapes) {
      if (s.defaultColour) {
        counts.set(s.defaultColour, (counts.get(s.defaultColour) ?? 0) + 1);
      }
      if (s.geometry.centreColour) {
        counts.set(s.geometry.centreColour, (counts.get(s.geometry.centreColour) ?? 0) + 1);
      }
    }
    return counts;
  }, [products, shapes]);

  const shown = colours
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => family === "all" || c.family === family);

  const update = (i: number, patch: Partial<Colour>) =>
    onChange(colours.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const add = () => {
    const n = colours.length + 1;
    onChange([
      ...colours,
      {
        id: `new-colour-${n}`,
        name: `New colour ${n}`,
        hex: "#cccccc",
        family: family === "all" ? "pink" : family,
        metallic: false,
        inStock: true,
      },
    ]);
  };

  const remove = (i: number) => {
    const c = colours[i];
    const used = usage.get(c.id) ?? 0;
    const warning = used
      ? `"${c.name}" is used in ${used} place${used === 1 ? "" : "s"}. Those will fall back to another colour. Delete anyway?`
      : `Delete "${c.name}"?`;
    if (window.confirm(warning)) onChange(colours.filter((_, j) => j !== i));
  };

  const outOfStock = colours.filter((c) => c.inStock === false).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">
          {colours.length} colours
          {outOfStock ? `, ${outOfStock} marked out of stock` : ""}. Untick{" "}
          <em>In stock</em> when you run out — the colour stays visible on the
          site but is dimmed and labelled, which answers the question before a
          customer has to ask it.
        </p>
        <p className="text-xs text-faint">
          Tip: photograph your wire in daylight and use your phone&apos;s
          eyedropper to get each hex exactly right.
        </p>
      </div>

      {/* family filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFamily("all")}
          className={clsx(
            "rounded-full px-3 py-1.5 text-2xs uppercase tracking-widest transition-colors",
            family === "all" ? "bg-surface-2 text-cream" : "text-faint hover:text-cream-2",
          )}
        >
          All
        </button>
        {wireFamilies.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFamily(f.id)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-2xs uppercase tracking-widest transition-colors",
              family === f.id ? "bg-surface-2 text-cream" : "text-faint hover:text-cream-2",
            )}
          >
            {f.label}
          </button>
        ))}

        <button
          type="button"
          onClick={add}
          className="ml-auto rounded-full border border-dashed border-line-firm px-4 py-1.5 text-sm text-cream-2 hover:border-brass hover:text-brass"
        >
          + Add a colour
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {shown.map(({ c, i }) => {
          const used = usage.get(c.id) ?? 0;
          return (
            <li
              key={i}
              className={clsx(
                "flex flex-wrap items-center gap-3 rounded-xl border p-3",
                c.inStock === false
                  ? "border-line bg-surface/20 opacity-70"
                  : "border-line bg-surface/40",
              )}
            >
              {/* swatch doubles as the colour picker */}
              <label
                className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-inset ring-black/30"
                style={{ backgroundColor: c.hex }}
                title="Click to pick a colour"
              >
                <span
                  className="sr-only"
                >{`Colour for ${c.name}`}</span>
                {c.metallic ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/55 to-transparent"
                  />
                ) : null}
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] cursor-pointer border-0 bg-transparent p-0"
                />
              </label>

              <input
                aria-label="Colour name"
                className={clsx(input, "w-auto min-w-36 flex-1")}
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

              <select
                aria-label="Colour group"
                className={clsx(input, "w-auto min-w-36")}
                value={c.family}
                onChange={(e) =>
                  update(i, { family: e.target.value as WireFamily })
                }
              >
                {wireFamilies.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>

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
                onClick={() => remove(i)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
              >
                <span className="sr-only">{`Delete ${c.name}`}</span>
                <span aria-hidden>×</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* a quick look at the whole palette together */}
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <h3 className="eyebrow">The whole shelf</h3>
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
    </div>
  );
}
