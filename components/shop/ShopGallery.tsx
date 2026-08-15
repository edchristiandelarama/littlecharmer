"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import QuickView from "./QuickView";
import {
  occasions,
  priceBands,
  productColours,
  productKinds,
  products,
  type OccasionId,
  type Product,
  type ProductKind,
} from "@/lib/products";
import { isInStock, wire, wireColours } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * The shop.
 *
 * Filters are collapsed by default and the pieces sit directly under the
 * heading. Open, the filter block ran to about 400px — so on a laptop the first
 * thing a visitor saw was a wall of controls rather than a single bouquet, which
 * is the wrong way round for a shop.
 *
 * Every filter is written into the URL, so a filtered view can be bookmarked or
 * sent to a customer ("here's everything under ₱1,500 in blue"), and the back
 * button behaves the way people expect.
 * =========================================================================== */

type FilterKey = "kind" | "occasion" | "colour" | "price";

function Chip({
  active,
  children,
  onClick,
  swatch,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors",
        active
          ? "border-brass bg-brass text-ink"
          : "border-line-firm text-cream-2 hover:border-brass hover:text-brass",
      )}
    >
      {swatch ? (
        <span
          aria-hidden
          className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/30"
          style={{ backgroundColor: swatch }}
        />
      ) : null}
      {children}
    </button>
  );
}

export default function ShopGallery({
  heading = true,
  limit,
}: {
  heading?: boolean;
  /** Cap the grid — used for the home page preview. */
  limit?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [quick, setQuick] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const kind = params.get("kind") as ProductKind | null;
  const occasion = params.get("occasion") as OccasionId | null;
  const colour = params.get("colour");
  const price = params.get("price");

  const setFilter = useCallback(
    (key: FilterKey, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      // Tapping an active chip clears it — a filter you can't turn off is a trap.
      if (!value || next.get(key) === value) next.delete(key);
      else next.set(key, value);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = () => router.replace(pathname, { scroll: false });

  const filtered = useMemo(() => {
    const band = priceBands.find((b) => b.id === price);

    return products.filter((p) => {
      if (kind && p.kind !== kind) return false;
      if (occasion && !p.occasions.includes(occasion)) return false;
      if (band && (p.price < band.min || p.price > band.max)) return false;
      if (colour && !productColours(p).includes(colour)) return false;
      return true;
    });
  }, [kind, occasion, colour, price]);

  const shown = limit ? filtered.slice(0, limit) : filtered;
  const active = [kind, occasion, colour, price].filter(Boolean).length;

  /** A plain-language summary of what's on, for the collapsed bar. */
  const summary = [
    kind && productKinds.find((k) => k.id === kind)?.label,
    occasion && occasions.find((o) => o.id === occasion)?.label,
    colour && wire(colour).name,
    price && priceBands.find((b) => b.id === price)?.label,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-8">
      {heading ? (
        <div className="flex flex-col gap-4">
          {/* The bar: one row, always. Everything else is behind it. */}
          <div className="flex flex-wrap items-center gap-3 border-y border-line py-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="shop-filters"
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                active > 0
                  ? "border-brass text-brass"
                  : "border-line-firm text-cream-2 hover:border-brass hover:text-brass",
              )}
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
                <path
                  d="M2 4h12M4 8h8M6.5 12h3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Filter
              {active > 0 ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brass px-1 text-2xs font-semibold text-ink">
                  {active}
                </span>
              ) : null}
              <span aria-hidden className="text-faint">
                {open ? "▴" : "▾"}
              </span>
            </button>

            <p className="text-sm text-muted" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              {summary ? (
                <span className="text-cream-2"> · {summary}</span>
              ) : null}
            </p>

            {active > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto text-sm text-brass underline underline-offset-4 hover:text-brass-bright"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {open ? (
            <div id="shop-filters" className="flex flex-col gap-5 pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-1 w-20">Type</span>
                {productKinds.map((k) => (
                  <Chip
                    key={k.id}
                    active={kind === k.id}
                    onClick={() => setFilter("kind", k.id)}
                  >
                    {k.label}
                  </Chip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-1 w-20">Occasion</span>
                {occasions.map((o) => (
                  <Chip
                    key={o.id}
                    active={occasion === o.id}
                    onClick={() => setFilter("occasion", o.id)}
                  >
                    {o.label}
                  </Chip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="eyebrow mr-1 w-20">Budget</span>
                {priceBands.map((b) => (
                  <Chip
                    key={b.id}
                    active={price === b.id}
                    onClick={() => setFilter("price", b.id)}
                  >
                    {b.label}
                  </Chip>
                ))}
              </div>

              {/* Colours as swatches rather than named groups — you pick the
                  colour you can see, not the category someone filed it under. */}
              <div className="flex flex-wrap items-start gap-2">
                <span className="eyebrow mr-1 mt-2 w-20">Colour</span>
                <ul className="flex flex-1 flex-wrap gap-1.5">
                  {wireColours.filter(isInStock).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setFilter("colour", c.id)}
                        aria-pressed={colour === c.id}
                        title={c.name}
                        className={clsx(
                          "grid h-8 w-8 place-items-center rounded-full ring-1 ring-inset ring-black/30 transition-transform",
                          colour === c.id
                            ? "scale-110 outline outline-2 outline-offset-2 outline-brass"
                            : "hover:scale-110",
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        <span className="sr-only">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-firm p-8">
          <h3 className="font-display text-2xl">Nothing matches that combination</h3>
          <p className="max-w-prose text-cream-2">
            Everything is made to order, so this is a limit of what we&apos;ve
            photographed, not what we can make. Clear a filter — or tell us what
            you&apos;re picturing and we&apos;ll build it.
          </p>
          <div className="mt-1 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brass-bright"
            >
              Clear filters
            </button>
            <a
              href="/order"
              className="rounded-full border border-line-firm px-5 py-2.5 text-sm hover:border-petal hover:text-petal"
            >
              Ask for something custom
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <ProductCard
              key={p.slug}
              product={p}
              priority={i < 3}
              onQuickView={setQuick}
            />
          ))}
        </div>
      )}

      <QuickView product={quick} onClose={() => setQuick(null)} />
    </div>
  );
}
