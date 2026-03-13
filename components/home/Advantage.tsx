"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

export default function Advantage() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        <SectionLabel>The Rosehill Advantage</SectionLabel>
        <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-dark mt-6">
          We deliver high-end products, professionally skilled trades, and
          cutting-edge building practices.
        </p>
        <div className="flex items-center justify-center gap-8 md:gap-12 mt-12">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-gold">20+</p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Years Experience
            </p>
          </div>
          <div className="w-px h-12 bg-warm-grey" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-gold">150+</p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Projects Completed
            </p>
          </div>
          <div className="w-px h-12 bg-warm-grey" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-light text-gold">GTA</p>
            <p className="text-[10px] md:text-xs uppercase tracking-widest text-medium-grey mt-2">
              Service Area
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
