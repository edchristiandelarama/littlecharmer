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
import { wire, wireFamilies, type WireFamily } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * The shop.
 *
 * Every filter is written into the URL, so a filtered view can be bookmarked,
 * shared, or sent to a customer directly ("here's everything under ₱1,500 in
 * blue"). It also means the back button behaves the way people expect.
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

  const kind = params.get("kind") as ProductKind | null;
  const occasion = params.get("occasion") as OccasionId | null;
  const colour = params.get("colour") as WireFamily | null;
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
      if (colour) {
        const families = new Set(productColours(p).map((id) => wire(id).family));
        if (!families.has(colour)) return false;
      }
      return true;
    });
  }, [kind, occasion, colour, price]);

  const shown = limit ? filtered.slice(0, limit) : filtered;
  const activeCount = [kind, occasion, colour, price].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8">
      {heading ? (
        <div className="flex flex-col gap-5">
          {/* kind */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Type</span>
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

          {/* occasion */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Occasion</span>
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

          {/* colour + price */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Colour</span>
            {wireFamilies.map((f) => (
              <Chip
                key={f.id}
                active={colour === f.id}
                onClick={() => setFilter("colour", f.id)}
                swatch={
                  {
                    pink: "#e23e57",
                    warm: "#f5a623",
                    green: "#4e8b4a",
                    cool: "#3d6fd4",
                    neutral: "#c9a227",
                  }[f.id]
                }
              >
                {f.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Budget</span>
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

          <div className="flex items-center gap-4 border-t border-line pt-4">
            <p className="text-sm text-muted" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              {activeCount > 0 ? " match your filters" : " in the shop"}
            </p>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-brass underline underline-offset-4 hover:text-brass-bright"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-firm p-8">
          <h3 className="font-display text-2xl">Nothing matches that combination</h3>
          <p className="max-w-prose text-cream-2">
            Everything is made to order, so this is a limit of what we've
            photographed, not what we can make. Clear a filter — or tell us what
            you're picturing and we'll build it.
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
