"use client";

import PhotoField from "./PhotoField";
import clsx from "@/lib/clsx";

/**
 * A short list of photo uploaders.
 *
 * The first one is the cover — it's what shows in the shop grid before anyone
 * hovers, so it's labelled rather than left for the owner to work out. Order is
 * adjustable for the same reason.
 */
export default function PhotoList({
  photos,
  onChange,
  max = 5,
  name,
  coverLabel = "Cover photo",
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  max?: number;
  /** Used to name the uploaded file. */
  name: string;
  coverLabel?: string;
}) {
  const list = photos.length ? photos : [""];

  const setAt = (i: number, value: string) => {
    const next = [...list];
    next[i] = value;
    onChange(next.filter((p, j) => p.trim() !== "" || j === 0));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (i: number) => onChange(list.filter((_, j) => j !== i));

  const filled = list.filter((p) => p.trim() !== "").length;

  return (
    <div className="flex flex-col gap-3">
      {list.map((photo, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span
              className={clsx(
                "text-2xs uppercase tracking-widest",
                i === 0 ? "text-brass" : "text-faint",
              )}
            >
              {i === 0 ? coverLabel : `Photo ${i + 1}`}
            </span>

            {list.length > 1 ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="grid h-6 w-6 place-items-center rounded-full border border-line-firm text-xs text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
                >
                  <span className="sr-only">Move earlier</span>
                  <span aria-hidden>↑</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === list.length - 1}
                  className="grid h-6 w-6 place-items-center rounded-full border border-line-firm text-xs text-cream-2 hover:border-brass hover:text-brass disabled:opacity-30"
                >
                  <span className="sr-only">Move later</span>
                  <span aria-hidden>↓</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="grid h-6 w-6 place-items-center rounded-full border border-line-firm text-xs text-faint hover:border-petal hover:text-petal"
                >
                  <span className="sr-only">Remove this photo</span>
                  <span aria-hidden>×</span>
                </button>
              </div>
            ) : null}
          </div>

          <PhotoField
            value={photo}
            productName={`${name}-${i + 1}`}
            onChange={(v) => setAt(i, v)}
          />
        </div>
      ))}

      {filled > 0 && list.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...list, ""])}
          className="self-start rounded-full border border-dashed border-line-firm px-3.5 py-1.5 text-xs text-cream-2 hover:border-brass hover:text-brass"
        >
          + Add another photo ({list.length}/{max})
        </button>
      ) : null}

      {filled > 1 ? (
        <p className="text-2xs text-faint">
          {filled} photos — they fade from one to the next when a customer hovers
          over the piece.
        </p>
      ) : null}
    </div>
  );
}
