import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isSignedIn } from "@/lib/admin-auth";
import { commitBinary, canWriteLocally } from "@/lib/content-store";

export const runtime = "nodejs";

/* ===========================================================================
 * PHOTO UPLOAD
 *
 * The browser has already shrunk and re-encoded the image before it gets here
 * (see PhotoField). This end just checks it and puts it somewhere permanent:
 * public/photos/ when running locally, or committed to the repo when deployed —
 * same reasoning as the content, since a deployed filesystem is thrown away.
 * =========================================================================== */

/** 3 MB after compression is already generous for a product photo. */
const MAX_BYTES = 3 * 1024 * 1024;

/** Turn a product name into a safe, readable filename. */
function safeName(raw: string): string {
  const base = raw
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // A timestamp suffix means re-uploading a photo for the same product never
  // gets served from a stale cache under the old filename.
  return `${base || "photo"}-${Date.now().toString(36)}.jpg`;
}

export async function POST(request: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let dataUrl = "";
  let suggestedName = "photo";
  try {
    const body = (await request.json()) as { image?: unknown; name?: unknown };
    dataUrl = typeof body.image === "string" ? body.image : "";
    if (typeof body.name === "string") suggestedName = body.name;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  const match = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return NextResponse.json(
      { ok: false, error: "That doesn't look like a JPEG, PNG or WebP image." },
      { status: 422 },
    );
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `That image is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB after compression — the limit is 3 MB. Try a smaller photo.`,
      },
      { status: 413 },
    );
  }

  const filename = safeName(suggestedName);
  const webPath = `/photos/${filename}`;

  if (canWriteLocally()) {
    try {
      const dir = path.join(process.cwd(), "public", "photos");
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), buffer);
      return NextResponse.json({
        ok: true,
        path: webPath,
        message: "Saved to public/photos/.",
      });
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: `Couldn't save the file: ${(error as Error).message}` },
        { status: 500 },
      );
    }
  }

  const result = await commitBinary(
    `public/photos/${filename}`,
    buffer,
    `Add product photo ${filename}`,
  );

  return NextResponse.json(
    result.ok
      ? { ok: true, path: webPath, message: result.message }
      : { ok: false, error: result.message },
    { status: result.ok ? 200 : 500 },
  );
}
