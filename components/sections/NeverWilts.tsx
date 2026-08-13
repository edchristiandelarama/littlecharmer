import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { promises } from "@/lib/site.config";

/**
 * The reason to buy these instead of real flowers.
 *
 * Deliberately the second thing on the page: the hero makes them beautiful, and
 * this answers the question that immediately follows — "why not just get fresh
 * ones?" Stated plainly, without hedging.
 */
export default function NeverWilts() {
  return (
    <section
      id="why"
      aria-labelledby="why-title"
      className="border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHead
          id="why-title"
          eyebrow="Why these, not fresh ones"
          title={
            <>
              Everything a real bouquet
              <br />
              <em className="text-petal">can&apos;t do.</em>
            </>
          }
        >
          We&apos;re not pretending these are real flowers. They&apos;re better at
          three specific things, and those three things are usually the whole
          reason people order.
        </SectionHead>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line-firm bg-line-firm md:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 110} className="bg-ink">
              <div className="flex h-full flex-col gap-4 p-7 lg:p-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl text-brass">{p.stat}</span>
                  <span className="text-xs leading-tight text-muted">
                    {p.statUnit}
                  </span>
                </div>
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="text-sm leading-relaxed text-cream-2">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
