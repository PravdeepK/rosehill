export interface Testimonial {
  quote: string;
  name: string;
  company: string;
}

export interface Service {
  name: string;
  description: string;
  highlight?: boolean;
}

export interface ServiceCategory {
  name: string;
  items: string[];
}

export interface ServiceSection {
  heading: string;
  description: string;
  categories: ServiceCategory[];
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
    company: "Sargenti Architects",
  },
  {
    quote:
      "I had the pleasure of working with Angelo on a very difficult project. My partners and I had just opened the Hotel X, in Toronto, when I was tasked with developing the Guerlain spa. Angelo's work was meticulous, and the environment he had to work in was challenging to almost impossible. Angelo had to construct the spa while the hotel was fully operational. Concrete transmits sound even better than water does. In spite of that, Angelo was able to accommodate our prohibitions from disturbing our guests, seemingly, magically. Today the Guerlain spa, at the Hotel X in Toronto, is their top producing spa in Canada.",
    name: "Josh Durst",
    company: "Library Hotel Collection",
  },
  {
    quote:
      "I've worked with a lot of contractors over the years and Rose Hill stands apart. They understood the demands of our project right away and kept things moving without ever cutting corners. The finished space speaks for itself.",
    name: "Billy Alexopoulos",
    company: "ProPhase Ltd.",
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

export const generalContracting: ServiceSection = {
  heading: "General Contracting",
  description:
    "At Rose Hill Design Build, we bring your vision to life from the ground up. With a commitment to quality craftsmanship, transparent communication, and meticulous attention to detail, we manage every phase of your project so you don't have to. Whether it's a custom home, a commercial build, or a full-scale renovation, our experienced team works alongside you from blueprint to final walkthrough. Building is personal, and we treat every project that way.",
  categories: [
    {
      name: "Turnkey Projects",
      items: [
        "Single-point responsibility from concept to completion",
        "Full coordination of design, permitting, and construction",
        "Budget and schedule management throughout all phases",
        "Contractor and subcontractor procurement",
        "Quality control and site supervision",
        "Final inspections and client handover",
      ],
    },
    {
      name: "New Construction",
      items: [
        "Custom residential and commercial builds",
        "Site evaluation and pre-construction planning",
        "Foundation, structural, and envelope construction",
        "Coordination of all trades and subcontractors",
        "Code compliance and permitting",
        "Construction administration and closeout",
      ],
    },
    {
      name: "Interior Fit-Outs",
      items: [
        "Commercial and retail tenant improvements",
        "Office and workspace build-outs",
        "Millwork, finishes, and fixture installation",
        "MEP coordination and integration",
        "Phased construction to minimize business disruption",
        "Design-assist services for interior layouts",
      ],
    },
    {
      name: "Project Management",
      items: [
        "End-to-end project scheduling and oversight",
        "Budget tracking and cost reporting",
        "Subcontractor coordination and management",
        "Risk identification and mitigation planning",
        "Progress reporting and client communication",
        "Quality assurance and punch list management",
      ],
    },
    {
      name: "Architectural Design & Value Engineering",
      items: [
        "Conceptual and schematic design services",
        "Design-build coordination and documentation",
        "Material and system substitution analysis",
        "Cost-saving alternatives without compromising quality",
        "Constructability reviews at all design phases",
        "Alignment of design intent with budget constraints",
      ],
    },
    {
      name: "Consulting",
      items: [
        "Pre-construction feasibility assessments",
        "Owner's representative services",
        "Bid review and contractor vetting",
        "Construction document and contract review",
        "Site assessment and due diligence",
        "Project recovery and troubleshooting for distressed builds",
      ],
    },
  ],
};
