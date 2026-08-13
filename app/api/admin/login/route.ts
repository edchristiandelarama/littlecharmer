import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkPassword,
  isAdminConfigured,
  makeSessionToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/* A slow, in-memory lockout. It resets when the server does, which is fine for
   a one-person shop — it exists to make guessing tedious, not to be a fortress. */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 10 * 60 * 1000;

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No admin password is set. Add ADMIN_PASSWORD to your environment variables, then restart.",
      },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  const record = attempts.get(key);
  if (record && record.count >= MAX_ATTEMPTS && Date.now() < record.until) {
    const minutes = Math.ceil((record.until - Date.now()) / 60000);
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${minutes} minutes.` },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    const next = record && Date.now() < record.until ? record.count + 1 : 1;
    attempts.set(key, { count: next, until: Date.now() + LOCKOUT_MS });
    return NextResponse.json(
      { ok: false, error: "That password isn't right." },
      { status: 401 },
    );
  }

  attempts.delete(key);

  const token = makeSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: token.maxAge,
  });
  return response;
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
