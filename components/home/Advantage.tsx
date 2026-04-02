"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

export default function Advantage() {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <SectionLabel>The Rose Hill Advantage</SectionLabel>
        <p className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed text-dark mt-6">
          We deliver high-end products, professionally skilled trades, and
          cutting-edge building practices.
        </p>
        <div className="grid grid-cols-3 mt-12 divide-x divide-warm-grey max-w-lg md:max-w-none mx-auto w-full">
          <div className="text-center px-4">
            <p className="text-2xl md:text-4xl font-light text-gold">20+</p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Years Experience
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl md:text-4xl font-light text-gold">150+</p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Projects Completed
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl md:text-4xl font-light text-gold">
              <span className="md:hidden">N.A.</span>
              <span className="hidden md:inline">North America</span>
            </p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Service Area
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
