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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div>
        <label
          htmlFor="phone"
          className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
        >
          Phone{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="project-type"
          className="block text-xs uppercase tracking-widest text-medium-grey mb-2"
        >
          Project Type
        </label>
        <select
          id="project-type"
          name="project-type"
          required
          className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
        >
          <option value="">Select a project type</option>
          <option value="luxury-retail">Luxury Retail</option>
          <option value="commercial">Commercial</option>
          <option value="residential">Residential</option>
          <option value="special">Special Project</option>
          <option value="other">Other</option>
        </select>
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
          className="w-full border border-warm-grey bg-transparent px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#b8963e" }}>
          {error}
        </p>
      )}

      <Button type="submit" variant="primary">
        {loading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
