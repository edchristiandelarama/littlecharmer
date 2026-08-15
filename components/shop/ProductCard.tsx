"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import PhotoSlideshow from "@/components/ui/PhotoSlideshow";
import {
  formatPeso,
  productColours,
  productPhotos,
  stemCount,
  type Product,
} from "@/lib/products";
import { ribbonById, wrapById } from "@/lib/flowers";
import { wire } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * A product card.
 *
 * Tilts toward the cursor, which is done with a CSS custom property written on
 * pointermove rather than React state — re-rendering a grid of cards on every
 * mouse event would drop frames on exactly the machines that can least afford it.
 *
 * When a product has no photograph yet, the card draws its bouquet from the
 * stem list instead. That's the difference between a shop that looks unfinished
 * and one that looks deliberately illustrated.
 * =========================================================================== */

export default function ProductCard({
  product,
  priority = false,
  onQuickView,
}: {
  product: Product;
  priority?: boolean;
  onQuickView?: (p: Product) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const colours = productColours(product);
  const photos = productPhotos(product);
  const wrap = wrapById(product.wrap);
  const ribbon = ribbonById(product.ribbon);

  const onMove = (e: React.PointerEvent) => {
    const el = frameRef.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * 9).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * 11).toFixed(2)}deg`);
  };

  const reset = () => {
    const el = frameRef.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <article
      className="group relative flex flex-col gap-4"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        reset();
      }}
    >
      <div
        ref={frameRef}
        onPointerMove={onMove}
        className={clsx(
          "relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-surface",
          "transition-[transform,border-color,box-shadow] duration-500 ease-[var(--ease-out-soft)]",
          "group-hover:border-line-firm group-hover:shadow-glow",
          "motion-safe:[transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* colour wash pulled from the piece's own wires */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(75% 60% at 50% 34%, ${wire(colours[0]).hex}2e, transparent 70%), radial-gradient(60% 50% at 76% 80%, ${wire(colours[1] ?? colours[0]).hex}22, transparent 72%)`,
          }}
        />

        {photos.length > 0 ? (
          <PhotoSlideshow
            photos={photos}
            alt={product.name}
            mode="hover"
            active={hovered}
            interval={1600}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            showDots
            className="h-full w-full"
            imageClassName="transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.045]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6">
            <BouquetSvg
              stems={product.stems}
              wrapHex={wrap.hex}
              ribbonHex={ribbon.hex}
              showWrap={product.kind !== "stem"}
              title={`${product.name} — illustrated from its stem list`}
              className="h-full w-auto transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
            />
          </div>
        )}

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.bestseller ? (
            <span className="rounded-full bg-brass px-2.5 py-1 text-2xs font-semibold uppercase tracking-widest text-ink">
              Bestseller
            </span>
          ) : null}
          {product.kind === "stem" ? (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-2xs font-semibold uppercase tracking-widest text-cream-2 backdrop-blur">
              Single stem
            </span>
          ) : null}
        </div>

        {/* quick view */}
        {onQuickView ? (
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className={clsx(
              "absolute inset-x-3 bottom-3 rounded-full bg-cream/95 py-2.5 text-sm font-semibold text-ink backdrop-blur",
              "transition-all duration-400 ease-[var(--ease-out-soft)] hover:bg-cream",
              hovered
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0 focus-visible:pointer-events-auto focus-visible:translate-y-0 focus-visible:opacity-100",
            )}
          >
            Quick look
          </button>
        ) : null}
      </div>

      {/* caption */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl leading-tight">
            <Link href={`/shop/${product.slug}`} className="hover:text-brass-bright">
              {/* Stretches the hit area over the whole card. */}
              <span className="absolute inset-0 z-10" aria-hidden />
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 font-display text-lg text-brass tabular-nums">
            {formatPeso(product.price)}
          </p>
        </div>

        <p className="line-clamp-2 text-sm text-muted">{product.blurb}</p>

        <div className="mt-0.5 flex items-center gap-2.5">
          <ul className="flex gap-1" aria-label="Colours in this piece">
            {colours.slice(0, 5).map((id) => (
              <li
                key={id}
                title={wire(id).name}
                className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/25"
                style={{ backgroundColor: wire(id).hex }}
              />
            ))}
          </ul>
          <span className="text-2xs uppercase tracking-widest text-faint">
            {stemCount(product)} stems
          </span>
        </div>
      </div>
    </article>
  );
}
