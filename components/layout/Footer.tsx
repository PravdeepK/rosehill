import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
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
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-warm-white/70 mb-4">
              Navigation
            </h4>
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
              <h4 className="text-xs uppercase tracking-widest text-warm-white/70 mb-4">
                {office.name}
              </h4>
              <div className="flex flex-col gap-1.5 text-sm text-warm-grey">
                <p className="text-warm-white">{office.company}</p>
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-medium-grey">
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
