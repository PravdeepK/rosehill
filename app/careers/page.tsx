"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";

const inputClasses =
  "w-full border border-warm-grey bg-warm-white px-4 py-3 text-sm text-dark placeholder:text-medium-grey/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors";

const fileInputClasses =
  "w-full border border-warm-grey bg-warm-white px-4 py-3 text-sm text-dark file:mr-4 file:border-0 file:bg-transparent file:text-xs file:uppercase file:tracking-widest file:text-gold file:cursor-pointer focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors";

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
    <section className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Careers</SectionLabel>
          <h1 className="text-3xl md:text-4xl font-light mt-4 mb-5 md:mb-6">
            Join Rose Hill
          </h1>
          <p className="text-medium-grey leading-relaxed mb-10 md:mb-12 max-w-2xl">
            Rose Hill is always looking to expand its local reach.
            Subcontractors and tradespeople interested in working with us should
            fill out the pre-qualification form below.
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
            className="space-y-5 md:space-y-6"
            noValidate
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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
                  autoComplete="name"
                  className={inputClasses}
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
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
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
                  autoComplete="tel"
                  inputMode="tel"
                  className={inputClasses}
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
                  autoComplete="email"
                  inputMode="email"
                  className={inputClasses}
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
              <div className="relative">
                <select
                  id="region"
                  name="region"
                  required
                  defaultValue=""
                  className={`${inputClasses} appearance-none pr-10 cursor-pointer`}
                >
                  <option value="" disabled>
                    Select a region
                  </option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-medium-grey"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            <div>
              <label
                htmlFor="resume"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Resume{" "}
                <span className="normal-case tracking-normal text-medium-grey/70">
                  (PDF or Word, max 10 MB)
                </span>
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className={fileInputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="coverLetter"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Cover Letter{" "}
                <span className="normal-case tracking-normal text-medium-grey/70">
                  (optional — PDF or Word, max 10 MB)
                </span>
              </label>
              <input
                id="coverLetter"
                name="coverLetter"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className={fileInputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
              >
                Message{" "}
                <span className="normal-case tracking-normal text-medium-grey/70">
                  (optional)
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className={`${inputClasses} resize-none`}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm"
                style={{ color: "#b8963e" }}
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Sending…" : "Submit Application"}
            </Button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
