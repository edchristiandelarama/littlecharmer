import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { LocketMark } from "@/components/brand/Logo";
import { contact, messengerUrl } from "@/lib/site.config";

/** The closing ask. Two routes in, because plenty of people prefer to chat. */
export default function OrderCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative overflow-hidden border-t border-line/60 py-24 lg:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(217,180,120,0.14), transparent 70%)",
        }}
      />

      <div className="container-narrow relative flex flex-col items-center gap-7 text-center">
        <Reveal>
          <LocketMark className="h-14 w-auto text-brass" />
        </Reveal>

        <Reveal as="h2" id="cta-title" delay={80} className="text-5xl sm:text-6xl">
          Tell us what you&apos;re
          <br />
          <em className="text-petal">picturing.</em>
        </Reveal>

        <Reveal as="p" delay={160} className="max-w-[52ch] text-lg text-cream-2">
          Every piece is made after you order it, so there&apos;s nothing to add to
          a cart — just tell us the occasion, the colours and roughly when, and
          we&apos;ll come back with a price and a real date.
        </Reveal>

        <Reveal delay={240} className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/order"
            className="rounded-full bg-brass px-8 py-4 font-semibold text-ink transition-colors hover:bg-brass-bright"
          >
            Start an order
          </Link>
          <a
            href={messengerUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-line-firm px-8 py-4 font-semibold transition-colors hover:border-petal hover:text-petal"
          >
            Or just message us
          </a>
        </Reveal>

        <Reveal as="p" delay={320} className="text-sm text-muted">
          We reply {contact.replyWindow}.
        </Reveal>
      </div>
    </section>
  );
}
