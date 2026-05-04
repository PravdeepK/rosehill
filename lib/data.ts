export interface Testimonial {
  quote: string;
  name: string;
  title: string;
}

export interface Service {
  name: string;
  description: string;
  highlight?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "We had an extremely tight deadline and needed to keep our dining room open. Angelo and his team worked day and night, kept us updated, and delivered on time and on budget.",
    name: "Britwin Dias",
    title: "Client",
  },
  {
    quote:
      "Angelo and his team were professional, hard working, and very talented. They completed my condo renovation ahead of schedule, on budget, and to perfection.",
    name: "Lisa Lama",
    title: "Client",
  },
  {
    quote:
      "After seeing their workmanship, I gave the job to Angelo. The renovation was completed as scheduled, better than expected, and over a year later not a single problem has occurred.",
    name: "Bill D.",
    title: "Partner",
  },
];

export const services: Service[] = [
  {
    name: "Branding & Design Activation",
    description:
      "Transforming luxury retail spaces with bespoke design solutions that elevate brand presence and customer experience.",
    highlight: true,
  },
  {
    name: "Pre-Construction",
    description:
      "Comprehensive planning and feasibility analysis to ensure your project starts on the right foundation.",
  },
  {
    name: "Design Implementation",
    description:
      "Bringing architectural visions to life with precision craftsmanship and meticulous project management.",
  },
  {
    name: "Building Activation",
    description:
      "Seamless transition from construction to operational spaces, ensuring every detail is move-in ready.",
  },
  {
    name: "Commercial Building",
    description:
      "Full-service commercial construction for offices, medical facilities, and professional spaces.",
  },
  {
    name: "Residential Building",
    description:
      "High-end residential construction and renovation for discerning homeowners.",
  },
  {
    name: "Special Project Capabilities",
    description:
      "Unique and complex builds that require specialized expertise and creative problem-solving.",
  },
];
