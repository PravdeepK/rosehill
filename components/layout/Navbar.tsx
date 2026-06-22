"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isOverlayPage = pathname === "/";
  // Force solid bar whenever mobile menu is open so the dropdown
  // doesn't sit under a transparent strip.
  const isTransparent = isOverlayPage && !scrolled && !mobileOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while mobile menu is open. Also close the menu when
  // the route changes (covers browser back/forward navigation while open).
  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  // Close menu when the route changes (derived-state pattern, see:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-warm-white/95 backdrop-blur-sm border-b border-warm-grey"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        <Link
          href="/"
          className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
          aria-label="Rose Hill Design Build — home"
        >
          {/* Two stacked renditions crossfaded by scroll state: the white
              wordmark reads over the dark hero, the colour wordmark over the
              light bar. Both are high-res PNGs (the old SVG was a traced
              bitmap that looked choppy). */}
          <span className="relative block h-auto w-[140px] md:w-[160px]">
            <Image
              src="/company-logos/rosehill-linear-colour.png"
              alt="Rose Hill Design Build"
              width={160}
              height={44}
              priority
              fetchPriority="high"
              className="h-auto w-full"
            />
            <Image
              src="/company-logos/rosehill-linear-white.png"
              alt=""
              aria-hidden
              width={160}
              height={44}
              priority
              className={`absolute inset-0 h-auto w-full transition-opacity duration-300 ${
                isTransparent ? "opacity-100" : "opacity-0"
              }`}
            />
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                // No prefetch: hovering otherwise fires a route fetch + JS
                // eval on the main thread, which hitches the hero video.
                prefetch={false}
                className={`text-sm uppercase tracking-widest transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none ${
                  active
                    ? "text-gold"
                    : isTransparent
                      ? "text-white/90"
                      : "text-dark"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative w-12 h-12 flex flex-col items-center justify-center gap-[5px] -mr-3 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <span
            className={`block w-6 h-0.5 transition-all duration-300 origin-center ${
              isTransparent ? "bg-white" : "bg-dark"
            } ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-all duration-300 ${
              isTransparent ? "bg-white" : "bg-dark"
            } ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 transition-all duration-300 origin-center ${
              isTransparent ? "bg-white" : "bg-dark"
            } ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 bg-warm-white ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-6 py-2 flex flex-col border-t border-warm-grey">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={`py-4 text-sm uppercase tracking-widest hover:text-gold transition-colors ${
                  active ? "text-gold" : "text-dark"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
