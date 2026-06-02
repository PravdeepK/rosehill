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

export interface Project {
  id: string;
  name: string;
  category: string;
  location: string;
  image: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "bangkok-garden",
    name: "Bangkok Garden",
    category: "Luxury Retail",
    location: "18 Elm St, Toronto",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    featured: true,
  },
  {
    id: "polar-dental",
    name: "Polar Dental",
    category: "Commercial",
    location: "3401 Dufferin, Toronto",
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
    featured: true,
  },
  {
    id: "interfaceware",
    name: "Interfaceware Inc",
    category: "Commercial",
    location: "672 Dupont St, Toronto",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    featured: true,
  },
  {
    id: "condo-33-harbour",
    name: "Condo Renovation",
    category: "Residential",
    location: "33 Harbour Square, Toronto",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    featured: false,
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Working with Rose Hill Design Build has been a true partnership. They communicate clearly, have great attention to detail, and share the same goal of bringing the project's vision to life.",
    name: "Melissa Bryner",
    title: "Partner",
  },
  {
    quote:
      "Rose Hill Design Build delivered our commercial space on time and exactly as we envisioned. From the first meeting their team was professional, organized, and genuinely invested in the outcome. We wouldn't trust anyone else with our next build.",
    name: "Geo Balaskas",
    title: "Client",
  },
  {
    quote:
      "I've worked with a lot of contractors over the years and Rose Hill stands apart. They understood the demands of our project right away and kept things moving without ever cutting corners. The finished space speaks for itself.",
    name: "Chris Mesner",
    title: "Client",
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
