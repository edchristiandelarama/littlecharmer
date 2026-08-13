import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* ===========================================================================
 * ADMIN SIGN-IN
 *
 * One password, one cookie. There is one person running this shop, so a user
 * database would be more moving parts than the problem deserves.
 *
 * The cookie holds a signed expiry rather than the password, so the password
 * itself never travels back and forth after sign-in, and the cookie can't be
 * forged or its expiry extended without the secret.
 * =========================================================================== */

export const ADMIN_COOKIE = "lc_admin";
const SESSION_HOURS = 12;

function secret(): string {
  // Falls back to the password so a local setup works with one env var, but
  // ADMIN_SECRET should be set separately in production.
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

/** Constant-time compare, so a wrong guess can't be narrowed down by timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function makeSessionToken(): { value: string; maxAge: number } {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  return {
    value: `${expires}.${sign(String(expires))}`,
    maxAge: SESSION_HOURS * 60 * 60,
  };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;

  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return safeEqual(signature, sign(expiresRaw));
}

/** True when the current request carries a valid admin session. */
export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}
