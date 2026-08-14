import { Suspense } from "react";
import type { Metadata } from "next";
import Builder from "@/components/builder/Builder";
import SectionHead from "@/components/ui/SectionHead";

export const metadata: Metadata = {
  title: "Build your own bouquet",
  description:
    "Pick the flower shapes, then pick any colour you like, and watch your bouquet come together in 3D. Share the link, then send it to us to make.",
};

export default function BuildPage() {
  return (
    <div className="container-page py-12 lg:py-20">
      <SectionHead eyebrow="The sandbox" title="Build your own">
        Choose a shape, then choose a colour — every shape comes in every colour,
        which is the one thing fresh flowers can't offer. Spin it, price it, share
        it, then send it to us and we'll make exactly that.
      </SectionHead>

      <div className="mt-10">
        <Suspense
          fallback={
            <div className="h-[600px] animate-pulse rounded-xl border border-line bg-surface/40" />
          }
        >
          <Builder />
        </Suspense>
      </div>
    </div>
  );
}
