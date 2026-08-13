import type { Metadata } from "next";
import ColourMatcher from "@/components/sections/ColourMatcher";
import SectionHead from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: "Colour matcher",
  description:
    "Pick a colour, or pull one straight out of a photo, and see the closest fuzzy wire shades we keep in stock. The thing a fresh-flower shop can't do.",
};

export default function ColourMatcherPage() {
  return (
    <div className="container-page py-14 lg:py-20">
      <SectionHead eyebrow="Match a colour" title="Send us a shade, we'll find the wire">
        Because the colour is the wire itself and not a dye or a season, matching
        is genuinely possible here. Pick a colour below — or take it out of a photo
        of whatever you&apos;re matching — and we&apos;ll show you the nearest
        shades on our shelf.
      </SectionHead>

      <div className="mt-12">
        <ColourMatcher />
      </div>
    </div>
  );
}
