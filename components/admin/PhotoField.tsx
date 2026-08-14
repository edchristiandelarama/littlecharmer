"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * PHOTO UPLOAD
 *
 * The image is resized and re-encoded in the browser before it's sent.
 *
 * That matters more than it sounds: a photo straight off a phone is often 4–6 MB
 * and 4000px wide. Uploaded as-is, every one of those would be committed to the
 * repo forever AND downloaded by every customer on mobile data. Shrinking to
 * 1600px and re-encoding as JPEG turns 5 MB into roughly 200 KB with no visible
 * difference at the size these are actually displayed.
 * =========================================================================== */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

async function shrink(file: File): Promise<{ dataUrl: string; kb: number }> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  // base64 carries about a third of overhead; back it out for an honest size.
  const kb = Math.round((dataUrl.length * 0.75) / 1024);
  return { dataUrl, kb };
}

export default function PhotoField({
  value,
  productName,
  onChange,
}: {
  value: string;
  productName: string;
  onChange: (path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNote({ ok: false, text: "That file isn't an image." });
      return;
    }

    setBusy(true);
    setNote(null);
    try {
      const { dataUrl, kb } = await shrink(file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, name: productName || file.name }),
      });
      const body = await response.json();

      if (!response.ok || !body.ok) {
        setNote({ ok: false, text: body.error ?? "Upload failed." });
        return;
      }

      onChange(body.path);
      setNote({
        ok: true,
        text: `Uploaded (${kb} KB). ${body.message ?? ""}`.trim(),
      });
    } catch (error) {
      setNote({ ok: false, text: (error as Error).message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-4">
      {/* preview */}
      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-line-firm bg-surface">
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
            // The admin's own preview — no point optimising a one-off.
            unoptimized
          />
        ) : (
          <span className="grid h-full place-items-center px-2 text-center text-2xs text-faint">
            Drawn from the stem list
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label
            className={clsx(
              "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors",
              busy
                ? "border-line text-faint"
                : "border-line-firm text-cream-2 hover:border-brass hover:text-brass",
            )}
          >
            {busy ? "Uploading…" : value ? "Replace photo" : "Upload a photo"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              disabled={busy}
              className="sr-only"
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>

          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setNote(null);
              }}
              className="rounded-full border border-line-firm px-4 py-2 text-sm text-faint transition-colors hover:border-petal hover:text-petal"
            >
              Remove
            </button>
          ) : null}
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/photos/name.jpg"
          className="w-full rounded-lg border border-line-firm bg-surface px-3 py-2 text-xs text-cream placeholder:text-faint"
        />

        {note ? (
          <p
            className={clsx("text-xs", note.ok ? "text-leaf" : "text-petal-bright")}
          >
            {note.text}
          </p>
        ) : (
          <p className="text-xs text-faint">
            Any size — it&apos;s shrunk to 1600px and compressed before uploading.
          </p>
        )}
      </div>
    </div>
  );
}
