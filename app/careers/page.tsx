"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="pt-32 pb-24 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Careers</SectionLabel>
          <h1 className="text-3xl md:text-4xl font-light mt-4 mb-6">
            Join Rosehill
          </h1>
          <p className="text-medium-grey leading-relaxed mb-12">
            Rosehill is always looking to expand its local reach. Subcontractors
            and tradespeople interested in working with us should fill out the
            pre-qualification form below.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl font-light">
              Thank you for your interest.
            </p>
            <p className="text-medium-grey mt-2">
              We will review your submission and be in touch.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="trade"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Trade / Specialty
              </label>
              <input
                id="trade"
                name="trade"
                type="text"
                required
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors resize-none"
              />
            </div>

            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
