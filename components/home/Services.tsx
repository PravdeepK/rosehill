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
            What We Do
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, i) => (
            <Reveal
              key={service.name}
              delay={Math.min(i * 60, 300)}
              className={`group relative p-6 md:p-8 bg-warm-white border border-transparent hover:border-gold transition-colors duration-300 ${
                service.highlight
                  ? "sm:col-span-2 lg:col-span-2 lg:row-span-1 border-l-2 border-l-gold"
                  : ""
              }`}
            >
              {service.highlight && (
                <span className="text-[10px] uppercase tracking-widest text-gold mb-3 block">
                  Core Expertise
                </span>
              )}
              <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">
                {service.name}
              </h3>
              <p className="text-sm text-medium-grey leading-relaxed">
                {service.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
