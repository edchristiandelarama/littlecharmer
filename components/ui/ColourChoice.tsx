"use client";

import { isInStock, wire, wireColours, type WireColour } from "@/lib/wire-colours";
import clsx from "@/lib/clsx";

/* ===========================================================================
 * A flat shelf of wire colours.
 *
 * No groups or tabs. Thirty-odd swatches fit on one screen and are far quicker
 * to scan than five categories you have to click through — and grouping made
 * people believe a colour was unavailable when it was simply under another tab.
 *
 * Out-of-stock colours stay visible but dimmed and unselectable, which answers
 * "do you have red?" before anyone asks it.
 * =========================================================================== */

export function ColourSwatch({
  colour,
  selected,
  onSelect,
  size = "md",
}: {
  colour: WireColour;
  selected: boolean;
  onSelect: () => void;
  size?: "sm" | "md";
}) {
  const available = isInStock(colour);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!available}
      aria-pressed={selected}
      title={`${colour.name}${available ? "" : " — out of stock"}`}
      className={clsx(
        "relative grid aspect-square w-full place-items-center rounded-full",
        "ring-1 ring-inset ring-black/30 transition-transform",
        size === "sm" ? "min-w-7" : "min-w-9",
        selected
          ? "scale-110 outline outline-2 outline-offset-2 outline-brass"
          : available && "hover:scale-105",
        !available && "cursor-not-allowed opacity-30",
      )}
      style={{ backgroundColor: colour.hex }}
    >
      <span className="sr-only">
        {colour.name}
        {available ? "" : " (out of stock)"}
      </span>
      {colour.metallic ? (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/55 to-transparent"
        />
      ) : null}
    </button>
  );
}

export default function ColourChoice({
  value,
  onChange,
  columns = "grid-cols-8",
  size = "md",
  label,
}: {
  value: string;
  onChange: (id: string) => void;
  columns?: string;
  size?: "sm" | "md";
  /** Shown under the grid; defaults to the selected colour's name. */
  label?: boolean;
}) {
  const selected = wire(value);

  return (
    <div className="flex flex-col gap-2.5">
      <ul className={clsx("grid gap-2", columns)}>
        {wireColours.map((c) => (
          <li key={c.id}>
            <ColourSwatch
              colour={c}
              selected={value === c.id}
              onSelect={() => onChange(c.id)}
              size={size}
            />
          </li>
        ))}
      </ul>

      {label !== false ? (
        <p className="text-xs text-muted">
          <span className="text-cream-2">{selected.name}</span>
          {selected.metallic ? " · metallic" : ""}
        </p>
      ) : null}
    </div>
  );
}
