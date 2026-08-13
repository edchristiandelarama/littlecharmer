import type { Metadata } from "next";
import Link from "next/link";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { contact, messengerUrl, site } from "@/lib/site.config";
import { flowerShapes, shape } from "@/lib/flowers";
import { formatPeso } from "@/lib/products";

export const metadata: Metadata = {
  title: "Bulk & events",
  description:
    "Fuzzy wire flowers in volume — wedding parties, graduation batches, corporate giveaways and event souvenirs. Identical every time, and they ship anywhere.",
};

const useCases = [
  {
    title: "Weddings",
    body: "Bridal bouquet with matching bridesmaid minis and boutonnières. Nothing wilts through a whole day in the heat, and everyone keeps theirs afterwards.",
    typical: "1 bridal + 4–8 minis",
  },
  {
    title: "Graduation batches",
    body: "One design in your school's colours, made in quantity for a whole class or org. Order early — March to June is our busiest stretch.",
    typical: "10–60 single stems or minis",
  },
  {
    title: "Corporate giveaways",
    body: "Tokens for clients, staff or conference delegates, in your brand colours. Far better received than the usual mug.",
    typical: "20–200 single stems",
  },
  {
    title: "Event souvenirs",
    body: "Debuts, anniversaries, reunions, church events. Single stems work out much cheaper per piece than bouquets.",
    typical: "18 roses for a debut, upward",
  },
];

export default function CustomPage() {
  const stem = shape("rose");

  return (
    <div className="container-page py-14 lg:py-20">
      <SectionHead eyebrow="Bulk & events" title="Twenty of them, or two hundred">
        Volume is where these make the most sense. Single stems are quick enough
        to make in quantity, they&apos;re identical every time, and — unlike fresh
        flowers — they can be made weeks ahead and boxed until the day.
      </SectionHead>

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <ul className="grid gap-px overflow-hidden rounded-xl border border-line-firm bg-line-firm sm:grid-cols-2">
            {useCases.map((u, i) => (
              <Reveal as="li" key={u.title} delay={i * 80} className="bg-ink">
                <div className="flex h-full flex-col gap-2 p-6">
                  <h2 className="font-display text-2xl">{u.title}</h2>
                  <p className="text-sm leading-relaxed text-cream-2">{u.body}</p>
                  <p className="mt-auto pt-3 text-2xs uppercase tracking-[0.15em] text-brass">
                    Typically {u.typical}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="flex flex-col gap-4 border-t border-line pt-8">
            <h2 className="font-display text-3xl">How pricing works in volume</h2>
            <p className="max-w-prose text-cream-2">
              There&apos;s no wholesale market to buy from here — the cost is the
              hours. So the discount on a big order comes from repetition: twenty
              identical stems are much faster per piece than twenty different ones.
            </p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                `A single ${stem.name.toLowerCase()} starts at ${formatPeso(stem.price)}, and takes ${stem.effort.replace("about ", "")}.`,
                "One repeated design in one or two colours is the cheapest way to do volume.",
                "Mixed designs, or many colours, cost closer to individual pieces.",
                "Tell us your quantity and budget and we'll tell you honestly what's achievable.",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-cream-2">
                  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-line pt-8">
            <h2 className="font-display text-3xl">What we can make</h2>
            <ul className="flex flex-wrap gap-2">
              {flowerShapes.map((f) => (
                <li
                  key={f.id}
                  className="flex items-baseline gap-2 rounded-full border border-line-firm px-3.5 py-2 text-sm"
                >
                  <span>{f.name}</span>
                  <span className="text-xs text-muted tabular-nums">
                    from {formatPeso(f.price)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">
              Anything not on this list, ask — most shapes are learnable given
              enough notice.
            </p>
          </div>
        </div>

        {/* enquiry */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4 rounded-xl border border-brass/40 bg-surface/60 p-6">
            <h2 className="font-display text-2xl">Get a quote</h2>
            <p className="text-sm text-cream-2">
              Send us the quantity, the date and the colours and we&apos;ll come
              back with a real number. For anything over about twenty pieces,
              please give us as much notice as you can.
            </p>

            <Link
              href="/order?occasion=corporate"
              className="rounded-full bg-brass px-6 py-3.5 text-center font-semibold text-ink transition-colors hover:bg-brass-bright"
            >
              Start a bulk enquiry
            </Link>
            <a
              href={messengerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-line-firm px-6 py-3 text-center text-sm transition-colors hover:border-petal hover:text-petal"
            >
              Discuss it on Messenger
            </a>

            <div className="flex flex-col gap-1 border-t border-line pt-4 text-sm">
              <p className="text-muted">Or reach us directly</p>
              <a href={`mailto:${contact.email}`} className="hover:text-brass">
                {contact.email}
              </a>
              <a href={`tel:${contact.phone}`} className="hover:text-brass">
                {contact.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-line p-6 text-sm">
            <h2 className="eyebrow">Worth knowing</h2>
            <p className="text-cream-2">
              Bulk orders can be made well ahead and stored — they don&apos;t
              degrade. If your event is months away, that&apos;s an advantage
              rather than a problem, and it means we can fit you in around the
              graduation rush.
            </p>
            <p className="mt-2 text-muted">
              We&apos;re in {site.location.city}, and we ship anywhere in the{" "}
              {site.location.country}.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
