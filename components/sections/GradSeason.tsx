import Link from "next/link";
import { gradSeason } from "@/lib/site.config";

/**
 * Graduation season is the busiest window of the year here, and the one where
 * being late genuinely matters — a bouquet that arrives after the ceremony is
 * worthless. Only rendered during the season, so it stays honest.
 *
 * Server-rendered from the build/request date rather than the client clock:
 * a static page would otherwise show whatever month it was when it was built.
 */
export default function GradSeason() {
  if (!gradSeason.active) return null;

  const month = new Date().getMonth() + 1;
  const inSeason =
    gradSeason.startMonth <= gradSeason.endMonth
      ? month >= gradSeason.startMonth && month <= gradSeason.endMonth
      : month >= gradSeason.startMonth || month <= gradSeason.endMonth;

  if (!inSeason) return null;

  return (
    <aside
      aria-labelledby="grad-title"
      className="border-y border-brass/25 bg-gradient-to-r from-surface/70 via-ink-2 to-surface/70"
    >
      <div className="container-page flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {/* toga */}
          <svg
            viewBox="0 0 32 32"
            className="mt-0.5 hidden h-8 w-8 shrink-0 text-brass sm:block"
            fill="none"
            aria-hidden
          >
            <path
              d="M16 5L3 11l13 6 13-6z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M8 13.5V21c0 2.2 3.6 4 8 4s8-1.8 8-4v-7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M28 11.5v7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col gap-0.5">
            <h2 id="grad-title" className="font-display text-xl">
              {gradSeason.headline} — the queue is filling up
            </h2>
            <p className="max-w-[62ch] text-sm text-cream-2">{gradSeason.body}</p>
          </div>
        </div>

        <Link
          href="/order"
          className="shrink-0 rounded-full border border-brass px-5 py-2.5 text-sm font-semibold text-brass transition-colors hover:bg-brass hover:text-ink"
        >
          Hold a slot
        </Link>
      </div>
    </aside>
  );
}
