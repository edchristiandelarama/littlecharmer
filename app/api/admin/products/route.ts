import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/admin-auth";
import { saveContent } from "@/lib/content-store";
import { productsSchema } from "@/lib/content-schema";

export const runtime = "nodejs";

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

  // Validated before writing: a malformed catalogue would break the next build
  // and take the shop offline until someone repaired the JSON by hand.
  const parsed = productsSchema.safeParse(body);
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

  const result = await saveContent(parsed.data, "content/products.json");
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
