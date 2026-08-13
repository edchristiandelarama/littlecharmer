import Link from "next/link";
import Accordion from "@/components/ui/Accordion";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import { contact, faqs, messengerUrl } from "@/lib/site.config";

export default function Faq({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHead id="faq-title" eyebrow="Questions" title="The things people ask">
            If it isn&apos;t here, just ask — we&apos;d rather answer than have you
            guess.
          </SectionHead>

          <Reveal delay={160} className="flex flex-col gap-2.5">
            <a
              href={messengerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full bg-brass px-6 py-3 text-center font-semibold text-ink transition-colors hover:bg-brass-bright"
            >
              Ask us on Messenger
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="rounded-full border border-line-firm px-6 py-3 text-center text-sm transition-colors hover:border-petal hover:text-petal"
            >
              {contact.email}
            </a>
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Accordion items={items} />
          {limit && faqs.length > limit ? (
            <Link
              href="/faq"
              className="self-start text-sm text-brass underline underline-offset-4 hover:text-brass-bright"
            >
              All {faqs.length} questions
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
