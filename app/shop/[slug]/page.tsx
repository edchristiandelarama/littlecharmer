import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import ProductCard from "@/components/shop/ProductCard";
import Reveal from "@/components/ui/Reveal";
import {
  formatPeso,
  occasions,
  productBySlug,
  productColours,
  products,
  stemCount,
} from "@/lib/products";
import { ribbonById, shape, wrapById } from "@/lib/flowers";
import { wire } from "@/lib/wire-colours";
import { encodeBuild } from "@/lib/build-encode";
import { fulfilment } from "@/lib/site.config";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.blurb,
    openGraph: { title: product.name, description: product.blurb },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const wrap = wrapById(product.wrap);
  const ribbon = ribbonById(product.ribbon);
  const colours = productColours(product);

  const asBuild = encodeBuild({
    stems: product.stems.map((s) => ({ shape: s.shape, colour: s.colour, qty: s.qty })),
    wrap: product.wrap,
    ribbon: product.ribbon,
    name: product.name,
  });

  // Nearest neighbours by shared occasion — better than "random other products".
  const related = products
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({
      p,
      score: p.occasions.filter((o) => product.occasions.includes(o)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  return (
    <div className="container-page py-10 lg:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <Link href="/shop" className="hover:text-brass">
          Shop
        </Link>
        <span className="mx-2 text-faint">/</span>
        <span className="text-cream-2">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* picture */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface lg:sticky lg:top-24 lg:self-start">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `radial-gradient(72% 58% at 50% 34%, ${wire(colours[0]).hex}30, transparent 70%)`,
            }}
          />
          {product.photo ? (
            <Image
              src={product.photo}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center p-10">
              <BouquetSvg
                stems={product.stems}
                wrapHex={wrap.hex}
                ribbonHex={ribbon.hex}
                showWrap={product.kind !== "stem"}
                title={`${product.name}, drawn from its stem list`}
                className="h-full w-auto"
              />
              <p className="absolute bottom-4 text-2xs uppercase tracking-widest text-faint">
                Illustrated · photograph coming
              </p>
            </div>
          )}
        </div>

        {/* detail */}
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">
              {product.occasions
                .map((o) => occasions.find((x) => x.id === o)?.label ?? o)
                .join(" · ")}
            </p>
            <h1 className="text-5xl">{product.name}</h1>
            <p className="font-display text-3xl text-brass">
              {formatPeso(product.price)}
            </p>
            <p className="text-lg text-cream-2">{product.blurb}</p>
          </div>

          {product.story ? (
            <p className="max-w-prose border-l-2 border-brass/40 pl-5 text-cream-2">
              {product.story}
            </p>
          ) : null}

          {/* recipe */}
          <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface/60 p-5">
            <h2 className="eyebrow">
              What's in it — {stemCount(product)} stems, all handmade
            </h2>
            <ul className="flex flex-col gap-2">
              {product.stems.map((s, i) => (
                <li
                  key={`${s.shape}-${s.colour}-${i}`}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/25"
                    style={{ backgroundColor: wire(s.colour).hex }}
                  />
                  <span className="text-cream-2">
                    {shape(s.shape).name} in {wire(s.colour).name}
                  </span>
                  <span className="ml-auto tabular-nums text-muted">×{s.qty}</span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex justify-between border-t border-line pt-3 text-sm text-muted">
              <span>{wrap.name}</span>
              <span>{ribbon.name}</span>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/order?product=${product.slug}`}
              className="rounded-full bg-brass px-8 py-4 text-center font-semibold text-ink transition-colors hover:bg-brass-bright"
            >
              Order this one
            </Link>
            <Link
              href={`/build?b=${asBuild}`}
              className="rounded-full border border-line-firm px-8 py-4 text-center font-semibold transition-colors hover:border-petal hover:text-petal"
            >
              Open it in the builder and change the colours
            </Link>
          </div>

          <dl className="flex flex-col gap-3 border-t border-line pt-6 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Lead time</dt>
              <dd className="text-cream-2">{fulfilment.leadTimeNote}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Delivery</dt>
              <dd className="text-cream-2">
                Anywhere in the Philippines — these travel far better than fresh
                flowers.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 text-muted">Payment</dt>
              <dd className="text-cream-2">{fulfilment.payments.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* related */}
      {related.length > 0 ? (
        <section aria-labelledby="related" className="mt-24">
          <Reveal as="h2" id="related" className="mb-8 text-3xl">
            Others for the same occasion
          </Reveal>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
