import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/admin-auth";
import { saveContent, saveTarget } from "@/lib/content-store";
import { contentSchema } from "@/lib/content-schema";

export const runtime = "nodejs";

/** Where a save would land, so the admin can warn before anyone types anything. */
export async function GET() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, target: saveTarget() });
}

export async function PUT(request: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  // Validate before writing. A malformed save would break the build and take
  // the whole site down until someone fixed the JSON by hand.
  const parsed = contentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Some fields aren't right.",
        issues: parsed.error.issues.slice(0, 12).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const result = await saveContent(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
