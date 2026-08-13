import Link from "next/link";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import { flowerShapes } from "@/lib/flowers";
import { wireColours } from "@/lib/wire-colours";

/**
 * The builder, pitched on the home page.
 *
 * Not the live 3D builder — a second WebGL canvas on the same page as the hero
 * is a lot to ask of a phone. This sells it and links through.
 */
export default function BuilderTeaser() {
  const bloomShapes = flowerShapes.filter((f) => f.id !== "leaf");
  const swatches = wireColours.filter((c) => c.family !== "green").slice(0, 14);

  return (
    <section
      id="builder"
      aria-labelledby="builder-title"
      className="relative overflow-hidden border-t border-line/60 bg-ink-2 py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 50% at 78% 40%, rgba(238,155,174,0.12), transparent 66%)",
        }}
      />

      <div className="container-page relative grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-7">
          <SectionHead
            id="builder-title"
            eyebrow="Build your own"
            title={
              <>
                Every shape,
                <br />
                <em className="text-petal">in every colour.</em>
              </>
            }
          >
            Pick the flowers, then pick the colours — that order round, because
            nothing here is limited by a season or a shipment. Spin it, price it,
            share the link, then send it to us and we&apos;ll make exactly that.
          </SectionHead>

          {/* the two steps, shown rather than described */}
          <Reveal delay={140} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-2xs uppercase tracking-[0.16em] text-faint">
                Step 1 — shape
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {bloomShapes.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-full border border-line-firm px-3 py-1.5 text-xs text-cream-2"
                  >
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-2xs uppercase tracking-[0.16em] text-faint">
                Step 2 — colour
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {swatches.map((c) => (
                  <li
                    key={c.id}
                    title={c.name}
                    className="h-6 w-6 rounded-full ring-1 ring-inset ring-black/30"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="sr-only">{c.name}</span>
                  </li>
                ))}
                <li className="grid h-6 place-items-center rounded-full border border-dashed border-line-firm px-2 text-2xs text-faint">
                  +{wireColours.length - swatches.length} more
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={220} className="flex flex-wrap gap-3">
            <Link
              href="/build"
              className="rounded-full bg-petal px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-petal-bright"
            >
              Open the builder
            </Link>
            <Link
              href="/colour-matcher"
              className="rounded-full border border-line-firm px-7 py-3.5 transition-colors hover:border-brass hover:text-brass"
            >
              Match a colour from a photo
            </Link>
          </Reveal>
        </div>

        {/* three of the same bouquet, three palettes — the pitch in one image */}
        <Reveal delay={120}>
          <ul className="grid grid-cols-3 gap-3">
            {[
              { colours: ["ruby", "wine", "ivory"], label: "Ruby" },
              { colours: ["cobalt", "powder", "ivory"], label: "Cobalt" },
              { colours: ["marigold", "sunbeam", "cream"], label: "Marigold" },
            ].map((set) => (
              <li key={set.label} className="flex flex-col gap-2">
                <div className="grid place-items-center rounded-xl border border-line bg-ink/50 p-3">
                  <BouquetSvg
                    stems={[
                      { shape: "rose", colour: set.colours[0], qty: 4 },
                      { shape: "tulip", colour: set.colours[2], qty: 2 },
                      { shape: "bud", colour: set.colours[1], qty: 2 },
                      { shape: "leaf", colour: "sage", qty: 2 },
                    ]}
                    wrapHex="#b08a5e"
                    ribbonHex="#c9a227"
                    className="h-full w-auto"
                  />
                </div>
                <p className="text-center text-2xs uppercase tracking-widest text-faint">
                  {set.label}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-xs text-muted">
            One design, three colourways. Same price, same week.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
