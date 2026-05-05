import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-dark text-warm-white">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12 md:mb-16">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-light mt-4">
            What Our Clients Say
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 120}
              className="border-l-2 border-gold pl-5 md:pl-6"
            >
              <blockquote>
                <p className="text-warm-grey text-[15px] md:text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-5">
                  <p className="text-sm font-medium text-warm-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-medium-grey mt-1">{t.title}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
