import type { ReactNode } from "react";
import clsx from "@/lib/clsx";
import Reveal, { RuleDraw } from "./Reveal";

/** The standard section opener: eyebrow, headline, optional standfirst. */
export default function SectionHead({
  eyebrow,
  title,
  children,
  align = "left",
  className,
  rule = true,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
  rule?: boolean;
  id?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={clsx(
        "flex flex-col gap-4",
        centered && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
      ) : null}

      <Reveal as="h2" id={id} delay={60} className="max-w-[22ch] text-4xl sm:text-5xl">
        {title}
      </Reveal>

      {rule ? (
        <RuleDraw className={clsx("w-16 opacity-70", centered && "self-center")} />
      ) : null}

      {children ? (
        <Reveal delay={120} className="max-w-[58ch] text-cream-2">
          {children}
        </Reveal>
      ) : null}
    </div>
  );
}
