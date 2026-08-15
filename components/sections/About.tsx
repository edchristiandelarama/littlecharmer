import PhotoSlideshow from "@/components/ui/PhotoSlideshow";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import { about, craftSteps } from "@/lib/site.config";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
        {/* picture */}
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-surface">
          {about.photos.length > 0 ? (
            <PhotoSlideshow
              photos={about.photos}
              alt={about.photoCaption}
              mode="auto"
              interval={4000}
              sizes="(min-width: 1024px) 42vw, 92vw"
              showDots
              className="absolute inset-0"
            />
          ) : (
            <>
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(65% 55% at 45% 35%, rgba(238,155,174,0.18), transparent 68%), radial-gradient(55% 45% at 75% 78%, rgba(217,180,120,0.14), transparent 70%)",
                }}
              />
              <div className="grid h-full place-items-center p-10">
                <BouquetSvg
                  stems={[
                    { shape: "rose", colour: "dusty-rose", qty: 4 },
                    { shape: "lily", colour: "cream", qty: 3 },
                    { shape: "bud", colour: "taupe", qty: 3 },
                    { shape: "leaf", colour: "sage", qty: 4 },
                  ]}
                  wrapHex="#b08a5e"
                  ribbonHex="#9cb39a"
                  className="h-full w-auto"
                />
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-2xs uppercase tracking-widest text-faint">
                Your photo goes here
              </p>
            </>
          )}
        </Reveal>

        {/* words */}
        <div className="flex flex-col gap-6">
          <SectionHead id="about-title" eyebrow={about.kicker} title={about.headline} />

          <div className="flex flex-col gap-4">
            {about.body.map((paragraph, i) => (
              <Reveal
                as="p"
                key={i}
                delay={i * 90}
                className="max-w-prose text-cream-2"
              >
                {paragraph}
              </Reveal>
            ))}
          </div>

          <Reveal delay={280}>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
              {craftSteps.map((s) => (
                <div key={s.step} className="flex flex-col gap-1">
                  <dt className="text-2xs uppercase tracking-[0.15em] text-brass">
                    {s.step}
                  </dt>
                  <dd className="text-xs leading-snug text-muted">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
