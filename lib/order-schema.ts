/* ===========================================================================
 * ORDER REQUEST — one schema, used by both the form and the API route.
 *
 * This is an order *request*, not a checkout. Nothing is charged and nothing is
 * committed; it lands in the shop's inbox and gets answered by a human.
 * =========================================================================== */

import { z } from "zod";
import { occasions } from "./products";

const occasionIds = occasions.map((o) => o.id) as [string, ...string[]];

export const contactMethods = [
  { id: "email", label: "Email" },
  { id: "messenger", label: "Facebook Messenger" },
  { id: "viber", label: "Viber or SMS" },
] as const;

export const budgetBands = [
  { id: "under-750", label: "Under ₱750" },
  { id: "750-1500", label: "₱750 – ₱1,500" },
  { id: "1500-2500", label: "₱1,500 – ₱2,500" },
  { id: "2500-4000", label: "₱2,500 – ₱4,000" },
  { id: "over-4000", label: "Over ₱4,000" },
  { id: "unsure", label: "Not sure yet — advise me" },
] as const;

export const deliveryMethods = [
  { id: "metro", label: "Deliver around Cebu" },
  { id: "province", label: "Ship anywhere in the Philippines" },
  { id: "pickup", label: "I'll pick it up" },
  { id: "unsure", label: "Not sure yet" },
] as const;

const idsOf = <T extends readonly { id: string }[]>(list: T) =>
  list.map((x) => x.id) as [string, ...string[]];

export const orderSchema = z.object({
  /* --- who's ordering --------------------------------------------------- */
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name")
    .max(80, "That name is too long"),

  email: z
    .string()
    .trim()
    .max(120)
    .email("That doesn't look like an email address")
    .or(z.literal(""))
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[0-9+()\-\s]*$/, "Numbers only, please")
    .optional(),

  /** Their Facebook name, so the shop can find the thread. */
  facebookName: z.string().trim().max(80).optional(),

  contactMethod: z.enum(idsOf(contactMethods)),

  /* --- what they want --------------------------------------------------- */
  occasion: z.enum(occasionIds).or(z.literal("other")),

  budget: z.enum(idsOf(budgetBands)),

  delivery: z.enum(idsOf(deliveryMethods)),

  deliveryArea: z.string().trim().max(120).optional(),

  /** Free text — they quote lead time per order, so no hard minimum here. */
  preferredDate: z.string().trim().max(40).optional(),

  colours: z.string().trim().max(300).optional(),

  recipientName: z.string().trim().max(80).optional(),

  notes: z.string().trim().max(1500, "Please keep this under 1500 characters").optional(),

  /* --- what they're referring to ---------------------------------------- */
  /** Encoded bouquet from the builder, if they came from there. */
  build: z.string().max(4000).optional(),
  /** Catalogue piece they started from, if any. */
  productSlug: z.string().max(80).optional(),

  /** Opt-in for a reminder before a recurring date. */
  remindMe: z.boolean().optional(),

  /**
   * Honeypot. Real people never see this field; bots fill it in.
   *
   * It must PASS validation — the route checks it after parsing and answers
   * with a fake success, so the bot thinks it worked and doesn't retry.
   * Rejecting it here instead would both tell the bot it was caught and, if a
   * password manager ever autofilled the field, show a real customer an error
   * on an input they can't see.
   */
  website: z.string().max(200).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

/**
 * At least one usable way to reply, matching how they said to reach them.
 * Checked separately from the field-level rules so the message can point at
 * the right input.
 */
export const orderSchemaWithContact = orderSchema.superRefine((v, ctx) => {
  const hasEmail = !!v.email?.trim();
  const hasPhone = !!v.phone?.trim();
  const hasFb = !!v.facebookName?.trim();

  if (v.contactMethod === "email" && !hasEmail) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "We need your email address to reply by email",
    });
  }
  if (v.contactMethod === "viber" && !hasPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "We need your number to reply on Viber or SMS",
    });
  }
  if (v.contactMethod === "messenger" && !hasFb) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["facebookName"],
      message: "Tell us the name on your Facebook account so we can find you",
    });
  }
  if (!hasEmail && !hasPhone && !hasFb) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["email"],
      message: "Leave us at least one way to reach you",
    });
  }
});

export const defaultOrder: Partial<OrderInput> = {
  contactMethod: "email",
  occasion: "just-because",
  budget: "unsure",
  delivery: "unsure",
  remindMe: false,
  website: "",
};

/* --- labels for the confirmation email ------------------------------------ */

export function labelFor(
  list: readonly { id: string; label: string }[],
  id: string | undefined,
): string {
  return list.find((x) => x.id === id)?.label ?? id ?? "—";
}

/** A short human reference so customer and shop can talk about one order. */
export function referenceCode(seed: number): string {
  const alphabet = "ACDEFHJKLMNPRTUVWXY349";
  let n = Math.floor(seed) % 1_000_000;
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length);
  }
  return `LC-${out}`;
}
