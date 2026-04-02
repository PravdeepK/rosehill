"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { services } from "@/lib/data";

export default function Services() {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-8 bg-light-grey">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <SectionLabel>Services</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-light mt-4">What We Do</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group p-6 md:p-8 bg-warm-white border border-warm-grey hover:border-gold transition-colors duration-300 ${
                service.highlight ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {service.highlight && (
                <span className="text-[10px] uppercase tracking-widest text-gold mb-3 block">
                  Core Expertise
                </span>
              )}
              <h3 className="text-lg font-medium mb-3">{service.name}</h3>
              <p className="text-sm text-medium-grey leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
