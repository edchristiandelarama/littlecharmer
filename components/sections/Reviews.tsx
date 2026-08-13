import Marquee from "@/components/ui/Marquee";
import SectionHead from "@/components/ui/SectionHead";
import { reviews } from "@/lib/site.config";

function Stars({ count }: { count: number }) {
  return (
    <p className="flex gap-0.5 text-brass" aria-label={`${count} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden
        >
          <path d="M10 1.6l2.5 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.1 2.7 1-5.8L1.7 7.7l5.8-.8z" />
        </svg>
      ))}
    </p>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <figure className="flex w-[19rem] shrink-0 flex-col gap-3 rounded-xl border border-line bg-surface/60 p-5 sm:w-[22rem]">
      <div className="flex items-center justify-between gap-3">
        <Stars count={review.stars} />
        <span className="text-2xs uppercase tracking-[0.14em] text-faint">
          {review.occasion}
        </span>
      </div>
      <blockquote className="text-sm leading-relaxed text-cream-2">
        &ldquo;{review.text}&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-baseline gap-2 border-t border-line pt-3 text-sm">
        <span className="font-display text-cream">{review.name}</span>
        <span className="text-xs text-muted">{review.where}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Two rows drifting in opposite directions. Splitting the list in half rather
 * than duplicating it means no review appears twice on screen at once.
 */
export default function Reviews() {
  const half = Math.ceil(reviews.length / 2);
  const rowOne = reviews.slice(0, half);
  const rowTwo = reviews.slice(half);

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="overflow-hidden border-t border-line/60 py-20 lg:py-28"
    >
      <div className="container-page">
        <SectionHead
          id="reviews-title"
          eyebrow="What people say"
          title="Still on the shelf, years later"
          align="center"
          className="mx-auto items-center"
        >
          The line we hear most is some version of &ldquo;I still have it&rdquo; —
          which is not something a florist gets told.
        </SectionHead>
      </div>

      <div className="mt-14 flex flex-col gap-4">
        <Marquee speed={72}>
          {rowOne.map((r) => (
            <ReviewCard key={r.name} review={r} />
          ))}
        </Marquee>
        <Marquee speed={86} reverse>
          {rowTwo.map((r) => (
            <ReviewCard key={r.name} review={r} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
