"use client";

import { useState } from "react";
import { contact, messengerUrl } from "@/lib/site.config";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * REACHING THE SHOP
 *
 * Two things here are less obvious than they look:
 *
 * 1. `mailto:` only opens something if the device HAS a mail app associated.
 *    On a lot of Windows machines nothing is, and the click appears to do
 *    nothing at all — the customer assumes the site is broken. So every email
 *    action also copies the address and says so.
 *
 * 2. Messenger's `m.me/<page>?text=...` does NOT prefill the message. Facebook
 *    doesn't support that parameter; the link just opens an empty chat and the
 *    order is silently lost. So instead we copy the order to the clipboard
 *    FIRST, then open Messenger, and tell the customer to paste.
 * =========================================================================== */

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard is blocked in some in-app browsers (notably Facebook's own).
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

/* ------------------------------------------------------------------------- */

export function EmailLink({
  subject,
  body,
  children,
  className,
}: {
  subject?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const href =
    `mailto:${contact.email}` +
    (subject || body
      ? `?${[
          subject ? `subject=${encodeURIComponent(subject)}` : "",
          body ? `body=${encodeURIComponent(body)}` : "",
        ]
          .filter(Boolean)
          .join("&")}`
      : "");

  return (
    <span className="flex flex-col gap-1.5">
      <a
        href={href}
        className={className}
        onClick={async () => {
          // Runs alongside the mailto, not instead of it. If a mail app opens,
          // no harm; if nothing happens, they still have the address.
          if (await copy(contact.email)) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 4000);
          }
        }}
      >
        {children ?? contact.email}
      </a>
      <span
        aria-live="polite"
        className={clsx(
          "text-xs transition-colors",
          copied ? "text-leaf" : "text-faint",
        )}
      >
        {copied
          ? `Address copied — paste ${contact.email} into your email app`
          : `Or write to ${contact.email}`}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------------- */

/**
 * Sends an order to Messenger: copies the text, then opens the chat.
 *
 * Deliberately two visible steps, because the paste is the customer's job and
 * they need to know that before the chat window appears.
 */
export function MessengerOrderButton({
  text,
  className,
  label = "Send it on Messenger",
}: {
  text: string;
  className?: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const go = async () => {
    const ok = await copy(text);
    setState(ok ? "copied" : "failed");
    // A beat, so the "copied" message is read before the tab switches.
    window.setTimeout(() => window.open(messengerUrl, "_blank", "noopener"), 700);
  };

  return (
    <span className="flex flex-col gap-1.5">
      <button type="button" onClick={go} className={className}>
        {label}
      </button>
      <span
        aria-live="polite"
        className={clsx(
          "text-xs",
          state === "copied"
            ? "text-leaf"
            : state === "failed"
              ? "text-petal-bright"
              : "text-faint",
        )}
      >
        {state === "copied"
          ? "Order copied. Paste it into the chat that just opened."
          : state === "failed"
            ? "Couldn't copy automatically — copy the order text below by hand."
            : "We'll copy your order so you can paste it into the chat."}
      </span>
    </span>
  );
}
