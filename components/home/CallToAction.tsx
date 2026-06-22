import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";

export default function CallToAction() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-warm-white">
      <Reveal className="max-w-3xl mx-auto text-center">
        <SectionLabel>See What&apos;s Possible</SectionLabel>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mt-4 text-dark leading-tight">
          Let&apos;s build something <span className="text-gold">extraordinary</span>.
        </h2>
        <p className="text-medium-grey mt-5 max-w-xl mx-auto leading-relaxed">
          From concept to completion, our team partners with you to deliver
          design-build excellence on time and on budget.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-dark text-warm-white px-8 py-3.5 text-sm uppercase tracking-widest hover:bg-gold hover:text-dark transition-colors duration-300"
          >
            Connect With Us
          </Link>
          <a
            href="tel:905-826-7673"
            className="inline-flex items-center justify-center border border-dark text-dark px-8 py-3.5 text-sm uppercase tracking-widest hover:bg-dark hover:text-warm-white transition-colors duration-300"
          >
            905-826-7673
          </a>
        </div>
      </Reveal>
    </section>
  );
}
