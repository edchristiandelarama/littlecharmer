import Hero from "@/components/hero/Hero";
import NeverWilts from "@/components/sections/NeverWilts";
import GradSeason from "@/components/sections/GradSeason";
import PromoBanner from "@/components/sections/PromoBanner";
import ShopPreview from "@/components/sections/ShopPreview";
import BuilderTeaser from "@/components/sections/BuilderTeaser";
import OccasionFinder from "@/components/sections/OccasionFinder";
import HowWeMakeIt from "@/components/sections/HowWeMakeIt";
import About from "@/components/sections/About";
import Reviews from "@/components/sections/Reviews";
import ShippingPanel from "@/components/sections/ShippingPanel";
import Faq from "@/components/sections/Faq";
import OrderCta from "@/components/sections/OrderCta";

/*
 * Section order is an argument, not a layout:
 *
 *   hero          they're beautiful
 *   never wilts   ...and here's why not just buy real ones
 *   shop          here's what that looks like
 *   builder       and you can have it in any colour
 *   finder        no idea what you want? start here
 *   process       here's proof a person actually makes these
 *   about         here's who that person is
 *   reviews       here's someone other than us saying it
 *   shipping      and yes, we can get it to you
 *   faq           the remaining objections
 *   order         so, then
 */
export default function Home() {
  return (
    <>
      <Hero />
      <NeverWilts />
      <GradSeason />

      <div className="py-14 lg:py-16">
        <PromoBanner />
      </div>

      <ShopPreview />
      <BuilderTeaser />
      <OccasionFinder />
      <HowWeMakeIt />
      <About />
      <Reviews />
      <ShippingPanel />
      <Faq limit={5} />
      <OrderCta />
    </>
  );
}
