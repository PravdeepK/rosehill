import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import ServicesTabs from "@/components/services/ServicesTabs";
import { generalContracting } from "@/lib/data";

export const metadata = {
  title: "Services",
  description:
    "Rose Hill Design Build services — branding & design activation, pre-construction, commercial, residential, and special project capabilities across North America.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <section className="pt-32 md:pt-44 pb-32 md:pb-44 px-10 lg:px-24 bg-warm-grey">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <Reveal className="mb-20 md:mb-28 text-center">
          <SectionLabel className="mb-7">Services</SectionLabel>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-dark leading-[1.05] mb-10">
            General Contracting
          </h1>
          <p className="text-[15px] md:text-base text-medium-grey leading-[1.9] max-w-2xl mx-auto">
            {generalContracting.description}
          </p>
        </Reveal>

        {/* Our Capabilities */}
        <Reveal className="mb-16 md:mb-20">
          <div className="flex items-center gap-5 mb-12">
            <div className="h-px flex-1 bg-medium-grey/25" />
            <SectionLabel>Our Capabilities</SectionLabel>
            <div className="h-px flex-1 bg-medium-grey/25" />
          </div>
          <ServicesTabs categories={generalContracting.categories} />
        </Reveal>

      </div>
    </section>
  );
}
