import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { featuredProducts, products } from "@/lib/products";

/** A slice of the shop for the home page — the featured pieces, then a way in. */
export default function ShopPreview() {
  // Exactly three: the grid is three columns, and a fourth card would sit alone
  // on a second row. Mark more than three as `featured` in products.ts and the
  // extras simply don't appear here — they still show up in the full shop.
  const shown = (featuredProducts.length >= 3 ? featuredProducts : products).slice(0, 3);

  return (
    <section
      id="shop"
      aria-labelledby="shop-title"
      className="border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead id="shop-title" eyebrow="The shop" title="A few we make often">
            Every one of these can be rebuilt in your colours — these are just the
            ones we&apos;ve photographed.
          </SectionHead>

          <Reveal delay={140}>
            <Link
              href="/shop"
              className="rounded-full border border-line-firm px-6 py-3 text-sm transition-colors hover:border-brass hover:text-brass"
            >
              See all {products.length} pieces
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <ProductCard product={p} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
