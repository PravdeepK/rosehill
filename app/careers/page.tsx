"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
            Join Rose Hill
          </h1>
          <p className="text-medium-grey leading-relaxed mb-12">
            Rose Hill is always looking to expand its local reach. Subcontractors
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
            {/* Honeypot */}
            <input
              name="website"
              type="text"
              style={{ display: "none" }}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />

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
                htmlFor="region"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Region
              </label>
              <select
                id="region"
                name="region"
                required
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
              >
                <option value="">Select a region</option>
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="resume"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Resume <span className="normal-case tracking-normal">(PDF or Word, max 10 MB)</span>
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors file:mr-4 file:border-0 file:bg-transparent file:text-sm file:uppercase file:tracking-widest file:text-medium-grey file:cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="coverLetter"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Cover Letter{" "}
                <span className="normal-case tracking-normal">(optional — PDF or Word, max 10 MB)</span>
              </label>
              <input
                id="coverLetter"
                name="coverLetter"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors file:mr-4 file:border-0 file:bg-transparent file:text-sm file:uppercase file:tracking-widest file:text-medium-grey file:cursor-pointer"
              />
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

            {error && (
              <p className="text-sm" style={{ color: "#b8963e" }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="primary">
              {loading ? "Sending…" : "Submit Application"}
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
