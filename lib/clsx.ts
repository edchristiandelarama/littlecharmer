/**
 * Tiny class-name joiner. Not worth a dependency for what it does.
 *
 *   clsx("a", cond && "b", undefined, "c")  →  "a b c"
 */
export type ClassValue = string | number | null | undefined | false;

export default function clsx(...parts: ClassValue[]): string {
  let out = "";
  for (const p of parts) {
    if (!p && p !== 0) continue;
    out = out ? `${out} ${p}` : String(p);
  }
  return out;
}
