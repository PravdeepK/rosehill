"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      "project-type": (form.elements.namedItem("project-type") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-light">Thank you for reaching out.</p>
        <p className="text-medium-grey mt-2">
          We will be in touch shortly.
        </p>
      </div>
    );
  }

  const inputClasses =
    "w-full border border-warm-grey bg-warm-white px-4 py-3 text-sm text-dark placeholder:text-medium-grey/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" noValidate>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label
            htmlFor="phone"
            className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
          >
            Phone{" "}
            <span className="normal-case tracking-normal text-medium-grey/70">
              (optional)
            </span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="project-type"
            className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
          >
            Project Type
          </label>
          <div className="relative">
            <select
              id="project-type"
              name="project-type"
              required
              defaultValue=""
              className={`${inputClasses} appearance-none pr-10 cursor-pointer`}
            >
              <option value="" disabled>
                Select a project type
              </option>
              <option value="luxury-retail">Luxury Retail</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="special">Special Project</option>
              <option value="other">Other</option>
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
          rows={5}
          required
          maxLength={2000}
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
        {loading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
