import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Portfolio", href: "/portfolio-map" },
  { label: "Services", href: "/services" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

// Inline marks rather than an icon dependency — two paths don't justify one.
// Same URLs as JsonLd's sameAs; keep the two in step.
const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/rose-hill-design-build/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/RoseHillDesignBuild/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
];

const offices = [
  {
    name: "Canada",
    company: "Rose Hill Design Build",
    lines: ["6790 Kitimat Road, Unit 7", "Mississauga, ON L5N 5L9"],
  },
  {
    name: "United States",
    company: "Rose Hill Design Build LLC",
    lines: ["16192 Coastal Hwy.", "Lewes, DE 19958"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
              aria-label="Rose Hill Design Build — home"
            >
              <Image
                src="/company-logos/rose-hill-full.svg"
                alt="Rose Hill Design Build"
                width={200}
                height={55}
                className="w-[160px] md:w-[180px] h-auto brightness-0 invert mb-4"
              />
            </Link>
            <p className="text-warm-grey text-sm leading-relaxed">
              Leaders in Luxury.
              <br />
              Design-build excellence across North America.
            </p>
            {/* 44px targets per WCAG 2.5.8; the negative margin pulls the
                first icon's padding back so it optically aligns with the
                copy above rather than sitting indented. */}
            <div className="flex items-center gap-1 mt-4 -ml-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Rose Hill Design Build on ${social.label}`}
                  className="w-11 h-11 flex items-center justify-center text-warm-grey hover:text-gold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-warm-white/70 mb-4">
              Navigation
            </p>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-warm-grey hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {offices.map((office) => (
            <div key={office.name}>
              <p className="text-xs uppercase tracking-widest text-warm-white/70 mb-4">
                {office.name}
              </p>
              <div className="flex flex-col gap-1.5 text-sm text-warm-grey">
                <p className="text-warm-white">{office.company}</p>
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-warm-grey">
          <p>
            &copy; {new Date().getFullYear()} Rose Hill Design Build. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-warm-grey">
            <a
              href="tel:905-826-7673"
              className="hover:text-gold transition-colors"
            >
              905-826-7673
            </a>
            <a
              href="mailto:info@rosehilldesignbuild.com"
              className="hover:text-gold transition-colors"
            >
              info@rosehilldesignbuild.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
