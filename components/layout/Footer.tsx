import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-dark text-warm-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <Image
              src="/company-logos/rose-hill-full.svg"
              alt="Rose Hill Design Build"
              width={200}
              height={55}
              className="w-[180px] h-auto brightness-0 invert mb-4"
            />
            <p className="text-warm-grey text-sm leading-relaxed">
              Leaders in Luxury Retail.
              <br />
              Design-build excellence across North America.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {["Projects", "Careers", "Contact"].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="text-sm text-warm-grey hover:text-gold transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm text-warm-grey">
              <p>6790 Kitimat Road, Unit 7</p>
              <p>Mississauga, ON L5N 5L9</p>
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
            <div className="flex gap-4 mt-4">
              <a
                href="#"
                className="text-warm-grey hover:text-gold transition-colors text-sm"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-warm-grey hover:text-gold transition-colors text-sm"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-medium-grey">
          &copy; 2025 Rose Hill Design Build. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
