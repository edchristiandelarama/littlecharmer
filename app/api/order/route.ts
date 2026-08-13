import { NextResponse } from "next/server";
import { orderSchemaWithContact, referenceCode } from "@/lib/order-schema";
import { orderEmailHtml, orderPlainText } from "@/lib/order-message";
import { contact, site } from "@/lib/site.config";

/* ===========================================================================
 * Order requests.
 *
 * Sends an email through Resend when RESEND_API_KEY is set. When it isn't, this
 * responds with `emailed: false` and the form falls back to opening the
 * customer's own mail app with the order pre-typed, plus the Messenger button.
 *
 * That's deliberate: the site has to work on day one, with no accounts and no
 * keys. Adding a key is an upgrade, not a prerequisite.
 * =========================================================================== */

export const runtime = "nodejs";

/** Crude per-IP throttle. Resets when the server does, which is fine for the
 *  volume a small shop sees — it exists to stop a bot hammering the endpoint,
 *  not to be a real rate limiter. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);

  if (recent.size > 500) {
    for (const [key, times] of recent) {
      if (times.every((t) => now - t > WINDOW_MS)) recent.delete(key);
    }
  }

  return hits.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (throttled(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't read that request." },
      { status: 400 },
    );
  }

  const parsed = orderSchemaWithContact.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Some details need fixing.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const order = parsed.data;

  // Honeypot: a real person never sees this field, so anything in it is a bot.
  // Answer 200 so the bot believes it succeeded and doesn't retry.
  if (order.website && order.website.length > 0) {
    return NextResponse.json({ ok: true, reference: "LC-0000", emailed: true });
  }

  const reference = referenceCode(Date.now() + order.name.length * 7919);
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO || contact.email;
  const from = process.env.ORDER_EMAIL_FROM || "Little Charmer <onboarding@resend.dev>";

  if (!apiKey) {
    // No key configured — tell the client to use its fallbacks.
    return NextResponse.json({
      ok: true,
      reference,
      emailed: false,
      reason: "no-email-service",
    });
  }

  const buildUrl = order.build ? `${site.url}/build?b=${order.build}` : undefined;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New order ${reference} — ${order.name}`,
        // Replying in the mail client should reach the customer, not the shop.
        reply_to: order.email?.trim() || undefined,
        text: orderPlainText(order, reference),
        html: orderEmailHtml(order, reference, buildUrl),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Resend rejected the order email:", response.status, detail);
      // The order still matters more than the transport — let the customer
      // fall back rather than telling them it failed.
      return NextResponse.json({
        ok: true,
        reference,
        emailed: false,
        reason: "email-failed",
      });
    }

    return NextResponse.json({ ok: true, reference, emailed: true });
  } catch (error) {
    console.error("Could not reach the email service:", error);
    return NextResponse.json({
      ok: true,
      reference,
      emailed: false,
      reason: "email-unreachable",
    });
  }
}
