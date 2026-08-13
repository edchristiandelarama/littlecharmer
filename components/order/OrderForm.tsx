"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import BouquetSvg from "@/components/bouquet/BouquetSvg";
import CardPreview from "./CardPreview";
import {
  budgetBands,
  contactMethods,
  defaultOrder,
  deliveryMethods,
  orderSchemaWithContact,
  type OrderInput,
} from "@/lib/order-schema";
import { occasions, formatPeso, productBySlug } from "@/lib/products";
import { buildTotal, decodeBuild, describeBuild } from "@/lib/build-encode";
import { ribbonById, wrapById } from "@/lib/flowers";
import { contact, fulfilment, messengerUrl } from "@/lib/site.config";
import { orderShortText, orderPlainText } from "@/lib/order-message";
import clsx from "@/lib/clsx";

/* Small custom resolver so the same zod schema validates the form and the API
   route. Avoids pulling in @hookform/resolvers for twenty lines of glue. */
const resolver: Resolver<OrderInput> = async (values) => {
  const result = orderSchemaWithContact.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };

  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".") || "root";
    // Keep the first message per field; later ones are usually less specific.
    if (!errors[path]) errors[path] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors: errors as never };
};

type Outcome = {
  reference: string;
  emailed: boolean;
  order: OrderInput;
};

const inputClass =
  "w-full rounded-lg border border-line-firm bg-surface px-3.5 py-3 text-cream placeholder:text-faint transition-colors focus:border-brass";

function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-cream-2">
        {label}
        {required ? <span className="ml-1 text-petal">*</span> : null}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-petal">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export default function OrderForm() {
  const params = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const buildParam = params.get("build");
  const productParam = params.get("product");

  const build = useMemo(() => decodeBuild(buildParam), [buildParam]);
  const product = productParam ? productBySlug(productParam) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderInput>({
    resolver,
    defaultValues: {
      ...defaultOrder,
      build: buildParam ?? undefined,
      productSlug: productParam ?? undefined,
    } as OrderInput,
    mode: "onBlur",
  });

  // Keep the hidden references in sync if someone lands here with new params.
  useEffect(() => {
    setValue("build", buildParam ?? undefined);
    setValue("productSlug", productParam ?? undefined);
  }, [buildParam, productParam, setValue]);

  const contactMethod = watch("contactMethod");
  const cardMessage = watch("cardMessage") ?? "";
  const recipient = watch("recipientName") ?? "";
  const senderName = watch("name") ?? "";

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setServerError(
          data?.error ??
            "Something went wrong sending that. Please message us on Messenger instead.",
        );
        return;
      }

      setOutcome({
        reference: data.reference,
        emailed: Boolean(data.emailed),
        order: values,
      });
    } catch {
      setServerError(
        "We couldn't reach the shop just now. Please try Messenger, or check your connection.",
      );
    }
  });

  /* ----------------------------------------------------------------- done */
  if (outcome) {
    const short = orderShortText(outcome.order, outcome.reference);
    const full = orderPlainText(outcome.order, outcome.reference);

    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border border-line-firm bg-surface/50 p-7 text-center sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-brass text-brass">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
            <path
              d="M4 12.5l5 5L20 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <p className="eyebrow">Your reference is {outcome.reference}</p>
          <h2 className="text-4xl">
            {outcome.emailed ? "We've got it" : "Almost — one tap left"}
          </h2>
          <p className="mx-auto max-w-prose text-cream-2">
            {outcome.emailed ? (
              <>
                Your request is in our inbox and we'll reply {contact.replyWindow}{" "}
                with a price and a realistic date. Quote {outcome.reference} if you
                message us in the meantime.
              </>
            ) : (
              <>
                We haven't been able to send this automatically, so nothing has
                reached us yet. Use one of the buttons below and it will — your
                whole order is already written out for you.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <a
            href={`${messengerUrl}?text=${encodeURIComponent(short)}`}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full bg-brass px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-brass-bright"
          >
            Send it on Messenger
          </a>
          <a
            href={`mailto:${contact.email}?subject=${encodeURIComponent(
              `Order request ${outcome.reference}`,
            )}&body=${encodeURIComponent(full)}`}
            className="rounded-full border border-line-firm px-6 py-3 transition-colors hover:border-petal hover:text-petal"
          >
            Send it by email instead
          </a>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-5 text-left">
          <h3 className="eyebrow">What you asked for</h3>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-ink/60 p-4 text-xs leading-relaxed text-cream-2">
            {full}
          </pre>
        </div>

        <Link
          href="/shop"
          className="text-sm text-brass underline underline-offset-4 hover:text-brass-bright"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  /* ----------------------------------------------------------------- form */
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
        {/* honeypot — never shown, never announced */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        {/* --- you --- */}
        <fieldset className="flex flex-col gap-4">
          <legend className="eyebrow mb-2">About you</legend>

          <Field label="Your name" required error={errors.name?.message}>
            <input
              type="text"
              autoComplete="name"
              className={inputClass}
              placeholder="Maria Santos"
              {...register("name")}
            />
          </Field>

          <Field label="How should we reply?" required>
            <div className="flex flex-wrap gap-2">
              {contactMethods.map((m) => (
                <label
                  key={m.id}
                  className={clsx(
                    "cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors",
                    contactMethod === m.id
                      ? "border-brass bg-brass text-ink"
                      : "border-line-firm text-cream-2 hover:border-brass",
                  )}
                >
                  <input
                    type="radio"
                    value={m.id}
                    className="sr-only"
                    {...register("contactMethod")}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email"
              hint={contactMethod === "email" ? undefined : "Optional"}
              required={contactMethod === "email"}
              error={errors.email?.message}
            >
              <input
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="maria@email.com"
                {...register("email")}
              />
            </Field>

            <Field
              label="Mobile number"
              hint={contactMethod === "viber" ? undefined : "Optional"}
              required={contactMethod === "viber"}
              error={errors.phone?.message}
            >
              <input
                type="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="0917 123 4567"
                {...register("phone")}
              />
            </Field>
          </div>

          {contactMethod === "messenger" ? (
            <Field
              label="Your name on Facebook"
              required
              hint="So we can find the right thread"
              error={errors.facebookName?.message}
            >
              <input type="text" className={inputClass} {...register("facebookName")} />
            </Field>
          ) : null}
        </fieldset>

        {/* --- the order --- */}
        <fieldset className="flex flex-col gap-4 border-t border-line pt-7">
          <legend className="eyebrow mb-2">The order</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What's the occasion?" error={errors.occasion?.message}>
              <select className={inputClass} {...register("occasion")}>
                {occasions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
                <option value="other">Something else</option>
              </select>
            </Field>

            <Field label="Rough budget" error={errors.budget?.message}>
              <select className={inputClass} {...register("budget")}>
                {budgetBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="How should it get there?" error={errors.delivery?.message}>
              <select className={inputClass} {...register("delivery")}>
                {deliveryMethods.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Town or city"
              hint="So we can quote shipping"
              error={errors.deliveryArea?.message}
            >
              <input
                type="text"
                className={inputClass}
                placeholder="Cebu City"
                {...register("deliveryArea")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="When do you need it?"
              hint="We'll confirm — everything is made after you order"
              error={errors.preferredDate?.message}
            >
              <input
                type="text"
                className={inputClass}
                placeholder="Graduation on 12 April"
                {...register("preferredDate")}
              />
            </Field>

            <Field label="Who's it for?" hint="Optional" error={errors.recipientName?.message}>
              <input
                type="text"
                className={inputClass}
                placeholder="My mum"
                {...register("recipientName")}
              />
            </Field>
          </div>

          <Field
            label="Colours you'd like"
            hint="Name them, or describe what you're matching — a gown, a sablay, school colours"
            error={errors.colours?.message}
          >
            <input
              type="text"
              className={inputClass}
              placeholder="Maroon and gold, to match her sablay"
              {...register("colours")}
            />
          </Field>
        </fieldset>

        {/* --- the card --- */}
        <fieldset className="flex flex-col gap-4 border-t border-line pt-7">
          <legend className="eyebrow mb-2">The card</legend>
          <CardPreview
            value={cardMessage}
            to={recipient}
            from={senderName}
            onChange={(v) => setValue("cardMessage", v, { shouldValidate: true })}
            error={errors.cardMessage?.message}
          />
        </fieldset>

        {/* --- extras --- */}
        <fieldset className="flex flex-col gap-4 border-t border-line pt-7">
          <legend className="eyebrow mb-2">Anything else</legend>

          <Field
            label="Notes"
            hint="Tell us anything that would help — a photo you're matching, a theme, a deadline"
            error={errors.notes?.message}
          >
            <textarea rows={4} className={clsx(inputClass, "resize-y")} {...register("notes")} />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface/40 p-4">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-brass"
              {...register("remindMe")}
            />
            <span className="text-sm text-cream-2">
              Remind me before this date next year.
              <span className="block text-xs text-muted">
                We'll message you a week ahead. No newsletter, nothing else — we
                don't have one.
              </span>
            </span>
          </label>
        </fieldset>

        {serverError ? (
          <p role="alert" className="rounded-lg border border-petal/50 bg-petal/10 p-4 text-sm text-petal-bright">
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-brass px-8 py-4 text-lg font-semibold text-ink transition-colors hover:bg-brass-bright disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send order request"}
          </button>
          <p className="text-center text-xs text-muted">
            No payment now, and nothing is confirmed until we reply. {fulfilment.depositNote}
          </p>
        </div>
      </form>

      {/* --- what they're ordering --- */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
        {build ? (
          <div className="flex flex-col gap-4 rounded-xl border border-line-firm bg-surface/50 p-5">
            <h2 className="eyebrow">Your build</h2>
            <div className="grid place-items-center rounded-lg bg-ink/50 p-4">
              <BouquetSvg
                stems={build.stems}
                wrapHex={wrapById(build.wrap).hex}
                ribbonHex={ribbonById(build.ribbon).hex}
                showWrap={build.wrap !== "none"}
                title="The bouquet you built"
                className="h-48 w-auto"
              />
            </div>
            {build.name ? (
              <p className="font-display text-xl">&ldquo;{build.name}&rdquo;</p>
            ) : null}
            <ul className="flex flex-col gap-1 text-sm text-cream-2">
              {describeBuild(build).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Estimate</span>
              <span className="font-display text-xl text-brass tabular-nums">
                {formatPeso(buildTotal(build))}
              </span>
            </div>
            <Link
              href={`/build?b=${buildParam}`}
              className="text-center text-sm text-brass underline underline-offset-4"
            >
              Change it
            </Link>
          </div>
        ) : product ? (
          <div className="flex flex-col gap-4 rounded-xl border border-line-firm bg-surface/50 p-5">
            <h2 className="eyebrow">You're ordering</h2>
            <div className="grid place-items-center rounded-lg bg-ink/50 p-4">
              <BouquetSvg
                stems={product.stems}
                wrapHex={wrapById(product.wrap).hex}
                ribbonHex={ribbonById(product.ribbon).hex}
                showWrap={product.kind !== "stem"}
                title={product.name}
                className="h-48 w-auto"
              />
            </div>
            <div>
              <p className="font-display text-2xl">{product.name}</p>
              <p className="font-display text-lg text-brass">
                {formatPeso(product.price)}
              </p>
            </div>
            <p className="text-sm text-cream-2">{product.blurb}</p>
            <Link
              href={`/shop/${product.slug}`}
              className="text-sm text-brass underline underline-offset-4"
            >
              See the details
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-dashed border-line-firm p-5">
            <h2 className="font-display text-xl">Not sure what you want yet?</h2>
            <p className="text-sm text-cream-2">
              You don't need to decide here — describe it in the notes and we'll
              suggest something. Or start from a design.
            </p>
            <div className="mt-1 flex flex-col gap-2">
              <Link
                href="/build"
                className="rounded-full border border-line-firm px-4 py-2.5 text-center text-sm transition-colors hover:border-petal hover:text-petal"
              >
                Build one yourself
              </Link>
              <Link
                href="/shop"
                className="rounded-full border border-line-firm px-4 py-2.5 text-center text-sm transition-colors hover:border-brass hover:text-brass"
              >
                Browse the shop
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-ink p-5">
          <h2 className="eyebrow">Rather just message us?</h2>
          <p className="text-sm text-cream-2">
            Completely fine — plenty of orders start as a Messenger thread.
          </p>
          <a
            href={messengerUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-line-firm px-4 py-2.5 text-center text-sm transition-colors hover:border-brass hover:text-brass"
          >
            Open Messenger
          </a>
        </div>
      </aside>
    </div>
  );
}
