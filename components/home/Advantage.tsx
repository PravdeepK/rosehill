"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const stats: Array<{ value: string; mobileValue?: string; label: string }> = [
  { value: "30+", label: "Years Experience" },
  { value: "150+", label: "Projects Completed" },
  { value: "North America", mobileValue: "N.A.", label: "Service Area" },
];

export default function Advantage() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
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
              <p className="text-2xl md:text-4xl font-light text-gold leading-tight">
                {stat.mobileValue ? (
                  <>
                    <span className="md:hidden">{stat.mobileValue}</span>
                    <span className="hidden md:inline">{stat.value}</span>
                  </>
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
