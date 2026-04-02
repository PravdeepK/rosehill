"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { label: "Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isOverlayPage = pathname === "/" || pathname === "/projects";
  const isTransparent = isOverlayPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-warm-white/95 backdrop-blur-sm border-b border-warm-grey"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/company-logos/rose-hill-cropped.svg"
            alt="Rose Hill"
            width={32}
            height={40}
            className={`transition-all duration-300 ${
              isTransparent ? "brightness-0 invert" : ""
            }`}
          />
          <span
            className={`text-xl font-semibold tracking-wide uppercase transition-colors ${
              isTransparent ? "text-white" : "text-dark"
            }`}
          >
            Rose Hill
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-widest transition-colors hover:text-gold ${
                isTransparent ? "text-white/90" : "text-dark"
              } ${pathname === link.href ? "text-gold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative w-12 h-12 flex flex-col items-center justify-center gap-[5px] -mr-3"
          aria-label="Toggle menu"
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
        className={`md:hidden overflow-hidden transition-all duration-300 bg-warm-white ${
          mobileOpen ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="px-6 py-2 flex flex-col border-t border-warm-grey">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-3 text-sm uppercase tracking-widest text-dark hover:text-gold transition-colors ${
                pathname === link.href ? "text-gold" : ""
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
