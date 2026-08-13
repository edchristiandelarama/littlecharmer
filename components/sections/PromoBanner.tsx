import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { LocketMark } from "@/components/brand/Logo";
import { promo } from "@/lib/site.config";

/** The current offer. Hidden entirely when `promo.active` is false. */
export default function PromoBanner() {
  if (!promo.active) return null;

  return (
    <Reveal as="section" aria-labelledby="promo-title" className="container-page">
      <div className="relative overflow-hidden rounded-2xl border border-brass/35 bg-gradient-to-br from-surface via-ink-2 to-surface p-7 sm:p-10">
        {/* an oversized mark, cropped, as texture rather than decoration */}
        <LocketMark
          className="pointer-events-none absolute -right-10 -top-16 h-64 w-auto text-brass/[0.07]"
        />

        <div className="relative flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-2.5">
            <p className="eyebrow text-brass">{promo.kicker}</p>
            <h2 id="promo-title" className="max-w-[30ch] text-3xl sm:text-4xl">
              {promo.headline}
            </h2>
            <p className="max-w-[54ch] text-cream-2">{promo.body}</p>
          </div>

          <Link
            href={promo.ctaHref}
            className="shrink-0 rounded-full bg-brass px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-brass-bright"
          >
            {promo.ctaLabel}
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
