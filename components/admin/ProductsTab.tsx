"use client";

import { useMemo, useState } from "react";
import PhotoField from "./PhotoField";
import type { ProductsContent } from "@/lib/content-schema";
import { occasions, productKinds, formatPeso } from "@/lib/products";
import { flowerShapes, ribbons, wraps } from "@/lib/flowers";
import { wire, wireColours } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * PRODUCTS
 *
 * The catalogue editor. One piece open at a time — with fourteen products and a
 * dozen fields each, showing them all at once is a wall nobody can read.
 * =========================================================================== */

type Product = ProductsContent["products"][number];

const input =
  "w-full rounded-lg border border-line-firm bg-surface px-3 py-2.5 text-cream placeholder:text-faint focus:border-brass";
const labelCls = "flex flex-col gap-1.5 text-sm text-cream-2";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function ProductsTab({
  products,
  onChange,
}: {
  products: Product[];
  onChange: (next: Product[]) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const totals = useMemo(
    () =>
      products.map((p) => p.stems.reduce((n, s) => n + s.qty, 0)),
    [products],
  );

  const update = (i: number, patch: Partial<Product>) =>
    onChange(products.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= products.length) return;
    const next = [...products];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setOpenIndex(to);
  };

  const add = () => {
    const next: Product = {
      slug: `new-piece-${products.length + 1}`,
      name: "New piece",
      kind: "bouquet",
      price: 1200,
      occasions: ["just-because"],
      stems: [{ shape: "rose", colour: "blush", qty: 6 }],
      wrap: "kraft",
      ribbon: "gold",
      blurb: "",
      story: "",
      photo: "",
      featured: false,
      bestseller: false,
    };
    onChange([...products, next]);
    setOpenIndex(products.length);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs text-muted">
          {products.length} pieces. The first three marked <em>Featured</em> show
          on the home page; everything appears in the shop.
        </p>
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-dashed border-line-firm px-4 py-2 text-sm text-cream-2 hover:border-brass hover:text-brass"
        >
          + Add a piece
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {products.map((p, i) => {
          const open = openIndex === i;

          return (
            <li
              key={i}
              className={clsx(
                "rounded-xl border transition-colors",
                open ? "border-brass/50 bg-surface/60" : "border-line bg-surface/30",
              )}
            >
              {/* header row */}
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="grid h-10 w-9 shrink-0 place-items-center overflow-hidden rounded border border-line-firm bg-ink text-2xs text-faint">
                    {p.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "drawn"
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg">
                      {p.name || "Untitled"}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {formatPeso(p.price)} · {totals[i]} stems ·{" "}
                      {productKinds.find((k) => k.id === p.kind)?.label}
                      {p.featured ? " · featured" : ""}
                    </span>
                  </span>

                  <span aria-hidden className="text-faint">
                    {open ? "▾" : "▸"}
                  </span>
                </button>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
                  >
                    <span className="sr-only">Move up</span>
                    <span aria-hidden>↑</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === products.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
                  >
                    <span className="sr-only">Move down</span>
                    <span aria-hidden>↓</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${p.name}"? Anyone who saved a link to it will get a Not Found page.`,
                        )
                      ) {
                        onChange(products.filter((_, j) => j !== i));
                        setOpenIndex(null);
                      }
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
                  >
                    <span className="sr-only">Delete</span>
                    <span aria-hidden>×</span>
                  </button>
                </div>
              </div>

              {/* body */}
              {open ? (
                <div className="flex flex-col gap-5 border-t border-line px-4 pb-5 pt-4">
                  <div>
                    <h4 className="eyebrow mb-2">Photo</h4>
                    <PhotoField
                      value={p.photo ?? ""}
                      productName={p.name}
                      onChange={(photo) => update(i, { photo })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelCls}>
                      Name
                      <input
                        className={input}
                        value={p.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          // Keep the web address in step while it's obviously a
                          // new piece; never rewrite one that's been published.
                          const auto = p.slug.startsWith("new-piece");
                          update(i, auto ? { name, slug: slugify(name) } : { name });
                        }}
                      />
                    </label>

                    <label className={labelCls}>
                      <span>
                        Web address
                        <span className="ml-2 text-xs text-faint">
                          /shop/{p.slug || "…"}
                        </span>
                      </span>
                      <input
                        className={input}
                        value={p.slug}
                        onChange={(e) =>
                          update(i, { slug: slugify(e.target.value) })
                        }
                      />
                    </label>

                    <label className={labelCls}>
                      Price (₱)
                      <input
                        type="number"
                        min={0}
                        className={input}
                        value={p.price}
                        onChange={(e) =>
                          update(i, { price: Number(e.target.value) || 0 })
                        }
                      />
                    </label>

                    <label className={labelCls}>
                      Type
                      <select
                        className={input}
                        value={p.kind}
                        onChange={(e) =>
                          update(i, { kind: e.target.value as Product["kind"] })
                        }
                      >
                        {productKinds.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className={labelCls}>
                    <span>
                      Short description
                      <span className="ml-2 text-xs text-faint">
                        one or two lines, shown on the card
                      </span>
                    </span>
                    <textarea
                      rows={2}
                      className={input}
                      value={p.blurb}
                      onChange={(e) => update(i, { blurb: e.target.value })}
                    />
                  </label>

                  <label className={labelCls}>
                    <span>
                      The longer story
                      <span className="ml-2 text-xs text-faint">
                        optional, only on the product page
                      </span>
                    </span>
                    <textarea
                      rows={3}
                      className={input}
                      value={p.story ?? ""}
                      onChange={(e) => update(i, { story: e.target.value })}
                    />
                  </label>

                  {/* occasions */}
                  <div className="flex flex-col gap-2">
                    <h4 className="eyebrow">Occasions it suits</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {occasions.map((o) => {
                        const on = p.occasions.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() =>
                              update(i, {
                                occasions: on
                                  ? p.occasions.filter((x) => x !== o.id)
                                  : [...p.occasions, o.id],
                              })
                            }
                            aria-pressed={on}
                            className={clsx(
                              "rounded-full border px-3 py-1.5 text-xs transition-colors",
                              on
                                ? "border-brass bg-brass text-ink"
                                : "border-line-firm text-cream-2 hover:border-brass",
                            )}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* stems */}
                  <div className="flex flex-col gap-2">
                    <h4 className="eyebrow">
                      What&apos;s in it — {totals[i]} stems
                    </h4>
                    <p className="text-xs text-faint">
                      This drives the drawn bouquet, the colour dots and the
                      colour filter, so keep it accurate even once you have a
                      photo.
                    </p>

                    <div className="flex flex-col gap-2">
                      {p.stems.map((s, si) => (
                        <div key={si} className="flex flex-wrap items-center gap-2">
                          <select
                            className={clsx(input, "w-auto min-w-28 flex-1")}
                            value={s.shape}
                            onChange={(e) =>
                              update(i, {
                                stems: p.stems.map((x, j) =>
                                  j === si
                                    ? { ...x, shape: e.target.value as typeof x.shape }
                                    : x,
                                ),
                              })
                            }
                          >
                            {flowerShapes.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>

                          <span
                            aria-hidden
                            className="h-6 w-6 shrink-0 rounded-full ring-1 ring-inset ring-black/30"
                            style={{ backgroundColor: wire(s.colour).hex }}
                          />

                          <select
                            className={clsx(input, "w-auto min-w-32 flex-1")}
                            value={s.colour}
                            onChange={(e) =>
                              update(i, {
                                stems: p.stems.map((x, j) =>
                                  j === si ? { ...x, colour: e.target.value } : x,
                                ),
                              })
                            }
                          >
                            {wireColours.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min={1}
                            max={60}
                            aria-label="How many"
                            className={clsx(input, "w-20")}
                            value={s.qty}
                            onChange={(e) =>
                              update(i, {
                                stems: p.stems.map((x, j) =>
                                  j === si
                                    ? { ...x, qty: Number(e.target.value) || 1 }
                                    : x,
                                ),
                              })
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              update(i, {
                                stems: p.stems.filter((_, j) => j !== si),
                              })
                            }
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-firm text-faint hover:border-petal hover:text-petal"
                          >
                            <span className="sr-only">Remove this stem</span>
                            <span aria-hidden>×</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {p.stems.length < 12 ? (
                      <button
                        type="button"
                        onClick={() =>
                          update(i, {
                            stems: [
                              ...p.stems,
                              { shape: "rose", colour: "blush", qty: 3 },
                            ],
                          })
                        }
                        className="self-start rounded-full border border-dashed border-line-firm px-3 py-1.5 text-xs text-cream-2 hover:border-brass hover:text-brass"
                      >
                        + Add a flower
                      </button>
                    ) : null}
                  </div>

                  {/* finishing + flags */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelCls}>
                      Wrap
                      <select
                        className={input}
                        value={p.wrap}
                        onChange={(e) => update(i, { wrap: e.target.value })}
                      >
                        {wraps.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelCls}>
                      Ribbon
                      <select
                        className={input}
                        value={p.ribbon}
                        onChange={(e) => update(i, { ribbon: e.target.value })}
                      >
                        {ribbons.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-5">
                    <label className="flex items-center gap-2.5 text-sm text-cream-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-brass"
                        checked={Boolean(p.featured)}
                        onChange={(e) => update(i, { featured: e.target.checked })}
                      />
                      Featured on the home page
                    </label>
                    <label className="flex items-center gap-2.5 text-sm text-cream-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-brass"
                        checked={Boolean(p.bestseller)}
                        onChange={(e) =>
                          update(i, { bestseller: e.target.checked })
                        }
                      />
                      Show a &ldquo;Bestseller&rdquo; badge
                    </label>
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
