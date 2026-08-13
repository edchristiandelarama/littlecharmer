import { decodeBuild, buildSummaryText, buildTotal } from "./build-encode";
import { formatPeso, productBySlug, occasions } from "./products";
import {
  budgetBands,
  contactMethods,
  deliveryMethods,
  labelFor,
  type OrderInput,
} from "./order-schema";

/* ===========================================================================
 * Turning an order into words.
 *
 * One formatter, used by the email, the Messenger hand-off and the mailto
 * fallback, so all three say exactly the same thing. Plain text on purpose —
 * it has to survive being pasted into a Messenger thread.
 * =========================================================================== */

const occasionLabel = (id: string) =>
  id === "other" ? "Something else" : (occasions.find((o) => o.id === id)?.label ?? id);

export function orderLines(order: OrderInput, reference: string): string[] {
  const lines: string[] = [];

  lines.push(`Order request ${reference}`);
  lines.push("");
  lines.push(`Name: ${order.name}`);
  if (order.email?.trim()) lines.push(`Email: ${order.email.trim()}`);
  if (order.phone?.trim()) lines.push(`Phone: ${order.phone.trim()}`);
  if (order.facebookName?.trim()) lines.push(`Facebook: ${order.facebookName.trim()}`);
  lines.push(`Reply via: ${labelFor(contactMethods, order.contactMethod)}`);
  lines.push("");

  lines.push(`Occasion: ${occasionLabel(order.occasion)}`);
  lines.push(`Budget: ${labelFor(budgetBands, order.budget)}`);
  lines.push(`Delivery: ${labelFor(deliveryMethods, order.delivery)}`);
  if (order.deliveryArea?.trim()) lines.push(`Area: ${order.deliveryArea.trim()}`);
  if (order.preferredDate?.trim()) {
    lines.push(`Preferred date: ${order.preferredDate.trim()} (to be confirmed)`);
  }
  if (order.recipientName?.trim()) lines.push(`For: ${order.recipientName.trim()}`);
  if (order.colours?.trim()) lines.push(`Colours: ${order.colours.trim()}`);

  // Which piece, or which build — never both.
  const product = order.productSlug ? productBySlug(order.productSlug) : undefined;
  if (product) {
    lines.push("");
    lines.push(`Starting from: ${product.name} (${formatPeso(product.price)})`);
  }

  const build = decodeBuild(order.build);
  if (build) {
    lines.push("");
    lines.push("--- Built in the bouquet builder ---");
    lines.push(buildSummaryText(build));
    lines.push(`Estimate: ${formatPeso(buildTotal(build))}`);
  }

  if (order.cardMessage?.trim()) {
    lines.push("");
    lines.push("--- Card message ---");
    lines.push(order.cardMessage.trim());
  }

  if (order.notes?.trim()) {
    lines.push("");
    lines.push("--- Notes ---");
    lines.push(order.notes.trim());
  }

  if (order.remindMe) {
    lines.push("");
    lines.push("Wants a reminder before this date next year.");
  }

  return lines;
}

export function orderPlainText(order: OrderInput, reference: string): string {
  return orderLines(order, reference).join("\n");
}

/** Messenger's URL has a practical length limit, so this is the short version. */
export function orderShortText(order: OrderInput, reference: string): string {
  const build = decodeBuild(order.build);
  const product = order.productSlug ? productBySlug(order.productSlug) : undefined;

  const bits = [
    `Hi Little Charmer! Order request ${reference}.`,
    `I'm ${order.name}.`,
    product ? `I'd like the ${product.name}.` : null,
    build ? `I built a bouquet: ${build.stems.length} kinds, ${buildSummaryText(build).split("\n")[0]}.` : null,
    `Occasion: ${occasionLabel(order.occasion)}.`,
    `Budget: ${labelFor(budgetBands, order.budget)}.`,
    order.preferredDate?.trim() ? `Hoping for ${order.preferredDate.trim()}.` : null,
    order.colours?.trim() ? `Colours: ${order.colours.trim()}.` : null,
  ].filter(Boolean);

  return bits.join(" ");
}

/** Escape for embedding in the HTML email body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The email the shop receives.
 * Deliberately plain: it has to be readable on a phone, in Gmail, in the
 * Facebook Business inbox, and forwarded on. No images, no external CSS.
 */
export function orderEmailHtml(
  order: OrderInput,
  reference: string,
  buildUrl?: string,
): string {
  const rows = orderLines(order, reference)
    .slice(2) // the heading is rendered separately
    .map((line) => {
      if (line === "") return "<tr><td style=\"height:10px\"></td></tr>";
      if (line.startsWith("---")) {
        return `<tr><td style="padding:14px 0 6px;font:600 12px/1.4 -apple-system,Segoe UI,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8a7d88">${esc(
          line.replace(/-/g, "").trim(),
        )}</td></tr>`;
      }
      const [label, ...rest] = line.split(": ");
      if (rest.length > 0) {
        return `<tr><td style="padding:3px 0;font:400 15px/1.5 -apple-system,Segoe UI,sans-serif;color:#241e2b"><span style="color:#6e6578">${esc(
          label,
        )}:</span> <strong>${esc(rest.join(": "))}</strong></td></tr>`;
      }
      return `<tr><td style="padding:3px 0;font:400 15px/1.5 -apple-system,Segoe UI,sans-serif;color:#241e2b">${esc(
        line,
      )}</td></tr>`;
    })
    .join("");

  const buildLink = buildUrl
    ? `<tr><td style="padding:18px 0 0"><a href="${esc(
        buildUrl,
      )}" style="display:inline-block;background:#241e2b;color:#f6eff3;text-decoration:none;padding:11px 20px;border-radius:100px;font:600 14px/1 -apple-system,Segoe UI,sans-serif">Open their bouquet in the builder</a></td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#f7f5f8;padding:24px">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e3dce7;border-radius:12px">
  <tr><td style="padding:26px 26px 0">
    <p style="margin:0;font:600 12px/1.4 -apple-system,Segoe UI,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#7b3f62">New order request</p>
    <h1 style="margin:6px 0 2px;font:400 26px/1.2 Georgia,serif;color:#241e2b">${esc(reference)}</h1>
    <p style="margin:0 0 6px;font:400 14px/1.5 -apple-system,Segoe UI,sans-serif;color:#6e6578">from ${esc(
      order.name,
    )}</p>
  </td></tr>
  <tr><td style="padding:8px 26px 26px">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}${buildLink}</table>
  </td></tr>
</table>
</body></html>`;
}
