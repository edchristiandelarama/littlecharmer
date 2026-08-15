"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import PhotoSlideshow from "@/components/ui/PhotoSlideshow";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import {
  formatPeso,
  productPhotos,
  stemCount,
  type Product,
} from "@/lib/products";
import { ribbonById, shape, wrapById } from "@/lib/flowers";
import { wire } from "@/lib/wire-colours";
import { encodeBuild } from "@/lib/build-encode";
import { occasions } from "@/lib/products";

/** A peek at a piece without leaving the grid. */
export default function QuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!product) return;

    returnFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Keep tabbing inside the dialog.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      (returnFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [product, onClose]);

  if (!product) return null;

  const photos = productPhotos(product);
  const wrap = wrapById(product.wrap);
  const ribbon = ribbonById(product.ribbon);

  // Opening this piece in the builder means starting from its exact recipe.
  const asBuild = encodeBuild({
    stems: product.stems.map((s) => ({ shape: s.shape, colour: s.colour, qty: s.qty })),
    wrap: product.wrap,
    ribbon: product.ribbon,
    name: product.name,
  });

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-void/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        className="relative w-full max-w-3xl animate-[fade-up_0.4s_var(--ease-out-soft)] rounded-t-2xl border border-line-firm bg-ink shadow-lift sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-surface text-cream transition-colors hover:bg-surface-2"
        >
          <span className="sr-only">Close</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="grid gap-0 sm:grid-cols-[0.95fr_1.05fr]">
          {/* picture */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-surface sm:aspect-auto sm:rounded-l-2xl sm:rounded-tr-none">
            {photos.length > 0 ? (
              <PhotoSlideshow
                photos={photos}
                alt={product.name}
                mode="auto"
                interval={2600}
                sizes="(min-width: 640px) 45vw, 100vw"
                showDots
                className="absolute inset-0"
              />
            ) : (
              <div className="grid h-full place-items-center p-8">
                <BouquetSvg
                  stems={product.stems}
                  wrapHex={wrap.hex}
                  ribbonHex={ribbon.hex}
                  showWrap={product.kind !== "stem"}
                  className="h-full max-h-[46vh] w-auto"
                />
              </div>
            )}
          </div>

          {/* detail */}
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">
                {product.occasions
                  .slice(0, 2)
                  .map((o) => occasions.find((x) => x.id === o)?.label ?? o)
                  .join(" · ")}
              </p>
              <h2 id="quickview-title" className="text-3xl">
                {product.name}
              </h2>
              <p className="font-display text-2xl text-brass">
                {formatPeso(product.price)}
              </p>
            </div>

            <p className="text-cream-2">{product.blurb}</p>

            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <h3 className="eyebrow">What's in it — {stemCount(product)} stems</h3>
              <ul className="flex flex-col gap-1.5">
                {product.stems.map((s, i) => (
                  <li
                    key={`${s.shape}-${s.colour}-${i}`}
                    className="flex items-center gap-2.5 text-sm text-cream-2"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-black/25"
                      style={{ backgroundColor: wire(s.colour).hex }}
                    />
                    <span>
                      {shape(s.shape).name} · {wire(s.colour).name}
                    </span>
                    <span className="ml-auto tabular-nums text-muted">×{s.qty}</span>
                  </li>
                ))}
                <li className="mt-1 flex justify-between border-t border-line pt-2 text-sm text-muted">
                  <span>{wrap.name}</span>
                  <span>{ribbon.name}</span>
                </li>
              </ul>
            </div>

            <div className="mt-auto flex flex-col gap-2.5 pt-2">
              <Link
                href={`/order?product=${product.slug}`}
                className="rounded-full bg-brass px-6 py-3 text-center font-semibold text-ink transition-colors hover:bg-brass-bright"
              >
                Order this one
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/build?b=${asBuild}`}
                  className="rounded-full border border-line-firm px-4 py-2.5 text-center text-sm transition-colors hover:border-petal hover:text-petal"
                >
                  Customise it
                </Link>
                <Link
                  href={`/shop/${product.slug}`}
                  className="rounded-full border border-line-firm px-4 py-2.5 text-center text-sm transition-colors hover:border-brass hover:text-brass"
                >
                  Full details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
