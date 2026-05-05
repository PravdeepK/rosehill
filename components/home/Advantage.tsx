import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";

type Stat = {
  value: string;
  mobileValue?: string;
  label: string;
  /** Optional size override for long values that don't fit the default 4xl. */
  valueClass?: string;
};

const stats: Stat[] = [
  { value: "30+", label: "Years Experience" },
  { value: "150+", label: "Projects Completed" },
  {
    value: "North America",
    mobileValue: "N.A.",
    label: "Service Area",
    valueClass: "md:text-2xl lg:text-3xl",
  },
];

export default function Advantage() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 max-w-5xl mx-auto">
      <Reveal y={30} className="text-center">
        <SectionLabel>The Rose Hill Advantage</SectionLabel>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-snug md:leading-relaxed text-dark mt-6 max-w-3xl mx-auto">
          We deliver high-end products, professionally skilled trades, and
          cutting-edge building practices.
        </p>
        <div className="grid grid-cols-3 mt-12 md:mt-16 divide-x divide-warm-grey max-w-md md:max-w-3xl mx-auto w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center px-2 md:px-6 flex flex-col items-center"
            >
              {/* Fixed-height, bottom-aligned row so all stat values share
                  the same baseline regardless of font size. */}
              <div className="h-8 md:h-12 flex items-end justify-center">
                <p
                  className={`text-2xl md:text-4xl font-light text-gold leading-none whitespace-nowrap ${
                    stat.valueClass ?? ""
                  }`}
                >
                  {stat.mobileValue ? (
                    <>
                      <span className="md:hidden">{stat.mobileValue}</span>
                      <span className="hidden md:inline">{stat.value}</span>
                    </>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-3 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
