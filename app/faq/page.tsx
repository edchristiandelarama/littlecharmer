import type { Metadata } from "next";
import Accordion from "@/components/ui/Accordion";
import SectionHead from "@/components/ui/SectionHead";
import ShippingPanel from "@/components/sections/ShippingPanel";
import { EmailLink } from "@/components/ui/ContactActions";
import { contact, faqs, fulfilment, messengerUrl } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "How long fuzzy wire flowers last, how long they take to make, whether we can match a colour, how we ship, and how to pay.",
};

export default function FaqPage() {
  return (
    <>
      <div className="container-page py-14 lg:py-20">
        <SectionHead eyebrow="Questions" title="Everything people ask us">
          Genuinely everything — these are the messages we answer most often, so
          they&apos;re written out properly here.
        </SectionHead>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-16">
          <Accordion items={faqs} initial={-1} />

          <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface/50 p-5">
              <h2 className="eyebrow">Still stuck?</h2>
              <p className="text-sm text-cream-2">
                Ask us directly. We reply {contact.replyWindow}.
              </p>
              <a
                href={messengerUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full bg-brass px-5 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-brass-bright"
              >
                Message us
              </a>
              <EmailLink className="block rounded-full border border-line-firm px-5 py-2.5 text-center text-sm transition-colors hover:border-petal hover:text-petal">
                Email instead
              </EmailLink>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-line p-5 text-sm">
              <h2 className="eyebrow">How to pay</h2>
              <ul className="flex flex-col gap-1 text-cream-2">
                {fulfilment.payments.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">{fulfilment.depositNote}</p>
            </div>
          </aside>
        </div>
      </div>

      <ShippingPanel />
    </>
  );
}
