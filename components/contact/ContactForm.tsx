"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
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

      <Button type="submit" variant="primary">
        Send Message
      </Button>
    </form>
  );
}
