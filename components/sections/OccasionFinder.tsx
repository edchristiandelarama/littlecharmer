"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import SectionHead from "@/components/ui/SectionHead";
import { occasions, priceBands, products, productColours, type OccasionId } from "@/lib/products";
import { nearestWires, wire, wireColours } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * OCCASION FINDER
 *
 * For the visitor who has no idea what they want, which is most of them. Three
 * taps and it recommends three pieces, scored rather than filtered — so it can
 * always show something instead of dead-ending on "no results".
 * =========================================================================== */

type Step = 0 | 1 | 2 | 3;

export default function OccasionFinder() {
  const [step, setStep] = useState<Step>(0);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [colour, setColour] = useState<string | null>(null);

  const results = useMemo(() => {
    if (step < 3) return [];
    const band = priceBands.find((b) => b.id === budget);

    // Scored, not filtered: a near miss on budget is still worth showing if it
    // nails the occasion and the colour.
    return products
      .map((p) => {
        let score = 0;
        if (occasion && p.occasions.includes(occasion)) score += 5;
        if (band && p.price >= band.min && p.price <= band.max) score += 3;
        else if (band && p.price <= band.max * 1.25) score += 1;
        // Exact colour, then anything close to it — a piece in Cherry is a
        // fair answer to someone who asked for Ruby.
        if (colour) {
          const used = productColours(p);
          if (used.includes(colour)) score += 3;
          else {
            const near = new Set(
              nearestWires(wire(colour).hex, 5).map((m) => m.colour.id),
            );
            if (used.some((id) => near.has(id))) score += 1;
          }
        }
        if (p.bestseller) score += 1;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p);
  }, [step, occasion, budget, colour]);

  const restart = () => {
    setStep(0);
    setOccasion(null);
    setBudget(null);
    setColour(null);
  };

  // A plain array rather than a const tuple: `step < 3` doesn't narrow an index
  // type, so a tuple would reject questions[step] as possibly out of bounds.
  const questions: {
    title: string;
    options: { id: string; label: string; hint?: string }[];
    onPick: (id: string) => void;
  }[] = [
    {
      title: "What's it for?",
      options: occasions.map((o) => ({ id: o.id, label: o.label, hint: o.blurb })),
      onPick: (id: string) => {
        setOccasion(id as OccasionId);
        setStep(1);
      },
    },
    {
      title: "Roughly what are you spending?",
      options: priceBands.map((b) => ({ id: b.id, label: b.label, hint: undefined })),
      onPick: (id: string) => {
        setBudget(id);
        setStep(2);
      },
    },
    {
      title: "Any colour in mind?",
      options: [
        ...wireColours.map((c) => ({ id: c.id, label: c.name, hint: undefined })),
        { id: "any", label: "Surprise me", hint: undefined },
      ],
      onPick: (id: string) => {
        setColour(id === "any" ? null : id);
        setStep(3);
      },
    },
  ];

  const current = step < 3 ? questions[step] : null;

  return (
    <section
      id="finder"
      aria-labelledby="finder-title"
      className="border-t border-line/60 bg-ink-2 py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHead
          id="finder-title"
          eyebrow="Not sure what to get?"
          title="Three taps and we'll suggest something"
          align="center"
          className="mx-auto items-center"
        >
          Everything is made to order, so nothing here is a limit — it&apos;s just a
          shortcut past the browsing.
        </SectionHead>

        <div className="mx-auto mt-12 max-w-3xl">
          {/* progress */}
          <ol className="mb-7 flex items-center justify-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className={clsx(
                  "h-1 rounded-full transition-all duration-500",
                  step > i ? "w-10 bg-brass" : step === i ? "w-10 bg-petal" : "w-5 bg-line-firm",
                )}
              />
            ))}
          </ol>

          {current ? (
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-center font-display text-3xl">{current.title}</h3>
              <ul className="flex flex-wrap justify-center gap-2">
                {current.options.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => current.onPick(o.id)}
                      title={o.hint}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-full border border-line-firm px-4 py-2.5 text-sm",
                        "transition-colors hover:border-brass hover:bg-brass hover:text-ink",
                      )}
                    >
                      {step === 2 && o.id !== "any" ? (
                        <span
                          aria-hidden
                          className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/30"
                          style={{ backgroundColor: wire(o.id).hex }}
                        />
                      ) : null}
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>

              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as Step)}
                  className="text-xs text-faint underline underline-offset-4 hover:text-cream-2"
                >
                  Back a step
                </button>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="font-display text-3xl">
                  Three we&apos;d suggest
                </h3>
                <p className="max-w-prose text-sm text-cream-2">
                  Any of these can be remade in your colours — the colour is the
                  wire, so it costs us nothing to change it.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full border border-line-firm px-5 py-2.5 text-sm transition-colors hover:border-brass hover:text-brass"
                >
                  Start again
                </button>
                <Link
                  href="/build"
                  className="rounded-full bg-petal px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-petal-bright"
                >
                  Or design your own
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
