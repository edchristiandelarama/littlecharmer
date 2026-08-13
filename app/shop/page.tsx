import { Suspense } from "react";
import type { Metadata } from "next";
import ShopGallery from "@/components/shop/ShopGallery";
import SectionHead from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every fuzzy wire piece we make — bouquets, mini bouquets and single stems. Filter by occasion, colour and budget. All made to order, all in any colour you like.",
};

export default function ShopPage() {
  return (
    <div className="container-page py-16 lg:py-24">
      <SectionHead eyebrow="The shop" title="Everything we make">
        These are the designs we've photographed — but nothing here is fixed.
        Every piece can be rebuilt in any colour you like, and if you want
        something that isn't here, the builder or a message will get it made.
      </SectionHead>

      <div className="mt-12">
        {/* useSearchParams needs a boundary so the shell can still prerender. */}
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-lg border border-line bg-surface/40" />
          }
        >
          <ShopGallery />
        </Suspense>
      </div>
    </div>
  );
}
