"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/brand/Logo";
import clsx from "@/lib/clsx";

const nav = [
  { label: "Shop", href: "/shop" },
  { label: "Build your own", href: "/build" },
  { label: "How we make it", href: "/#process" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/faq" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The header sits over the hero transparently, then takes on a solid
  // background once there's content behind it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock the page behind the open drawer, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-b border-line/80 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label={`${"Little Charmer"} — home`}
          className="shrink-0 text-cream transition-colors hover:text-brass-bright"
        >
          <Logo className="text-[0.72rem] sm:text-[0.8rem]" />
        </Link>

        {/* desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-sm text-cream-2 transition-colors hover:bg-surface hover:text-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/order"
            className="hidden rounded-full bg-brass px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-bright sm:inline-block"
          >
            Start an order
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-cream transition-colors hover:bg-surface lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3.5 7h17M3.5 12h17M3.5 17h17"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line/70 bg-ink lg:hidden"
      >
        <nav aria-label="Main" className="container-page flex flex-col py-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-b border-line/50 py-4 font-display text-2xl text-cream transition-colors last:border-b-0 hover:text-brass-bright"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/order"
            className="mt-4 rounded-full bg-brass px-5 py-3.5 text-center font-semibold text-ink"
          >
            Start an order
          </Link>
        </nav>
      </div>
    </header>
  );
}
