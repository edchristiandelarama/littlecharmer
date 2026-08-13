import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { fulfilment, site } from "@/lib/site.config";

/**
 * Shipping, framed as the advantage it actually is.
 *
 * A fresh-flower shop can serve one city. These survive a courier van, so the
 * addressable market is the whole country — which is worth stating outright
 * rather than burying in a delivery FAQ.
 */
export default function ShippingPanel() {
  return (
    <section
      id="shipping"
      aria-labelledby="shipping-title"
      className="border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <SectionHead
            id="shipping-title"
            eyebrow="Getting it to you"
            title={
              <>
                Fresh flowers can&apos;t leave the city.
                <br />
                <em className="text-petal">These can.</em>
              </>
            }
          >
            Nothing here needs water, refrigeration or speed, so a courier is
            perfectly fine. Everything travels in a rigid box with the blooms
            braced so nothing gets crushed on the way.
          </SectionHead>

          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {fulfilment.zones.map((z, i) => (
              <Reveal as="li" key={z.name} delay={i * 80}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <div className="flex min-w-[16rem] flex-1 flex-col gap-0.5">
                    <h3 className="font-display text-xl">{z.name}</h3>
                    <p className="text-sm text-muted">{z.detail}</p>
                  </div>
                  <p className="shrink-0 text-sm text-brass tabular-nums">{z.cost}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={200} className="mt-10">
          <p className="max-w-prose rounded-xl border border-line bg-surface/50 p-5 text-sm text-cream-2">
            <strong className="text-cream">Made to order.</strong>{" "}
            {fulfilment.leadTimeNote} We&apos;re in {site.location.city}, so pick-up
            is always an option too.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
