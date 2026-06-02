import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-warm-grey">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12 md:mb-16">
          <SectionLabel>Services</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-light mt-4 text-dark">
            Excellence in Every Detail
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, i) => {
            // First card is the featured (top-left) card with a gold strip on
            // its left; the last card mirrors it in the bottom-right corner —
            // wide with a gold strip on its right — so the grid reads as a
            // balanced, symmetrical block instead of trailing off into an
            // empty cell.
            const featuredLeft = service.highlight;
            const featuredRight = i === services.length - 1;
            return (
              <Reveal
                key={service.name}
                delay={Math.min(i * 60, 300)}
                className={`group relative p-6 md:p-8 bg-warm-white border border-transparent hover:border-gold transition-colors duration-300 ${
                  featuredLeft
                    ? "sm:col-span-2 lg:col-span-2 lg:row-span-1 border-l-2 border-l-gold"
                    : featuredRight
                      ? "lg:col-span-2 border-r-2 border-r-gold"
                      : ""
                }`}
              >
                {featuredLeft && (
                  <span className="text-[10px] uppercase tracking-widest text-gold mb-3 block">
                    Core Expertise
                  </span>
                )}
                {featuredRight && (
                  <span className="text-[10px] uppercase tracking-widest text-gold mb-3 block lg:text-right">
                    Specialized Builds
                  </span>
                )}
                <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                  {service.name}
                </h3>
                <p className="text-sm text-medium-grey leading-relaxed">
                  {service.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
