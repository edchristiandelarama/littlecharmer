import { Suspense } from "react";
import type { Metadata } from "next";
import OrderForm from "@/components/order/OrderForm";
import SectionHead from "@/components/ui/SectionHead";
import { fulfilment } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Start an order",
  description:
    "Tell us what you'd like and we'll reply with a price and a date. No payment here — every piece is made to order by hand.",
};

export default function OrderPage() {
  return (
    <div className="container-page py-14 lg:py-20">
      <SectionHead eyebrow="Start an order" title="Tell us what you're picturing">
        This is a request, not a checkout — nothing is charged and nothing is
        confirmed until a real person has read it and replied. {fulfilment.leadTimeNote}
      </SectionHead>

      <div className="mt-12">
        <Suspense
          fallback={
            <div className="h-[600px] animate-pulse rounded-xl border border-line bg-surface/40" />
          }
        >
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}
