/**
 * Data for the `/portfolio-map` experience. Fully decoupled from
 * `lib/data.ts` — this feature owns its own types and content so the map can
 * evolve without touching the `/projects` page.
 *
 * The 5 Toronto entries are Rose Hill's real, already-public project data. The
 * 4 Boston / Miami entries are placeholder content (`placeholder: true`) with no
 * real project behind them yet — the UI marks them as such and they should be
 * trivial to find-and-replace once real data exists.
 */

export type ProjectCategory =
  | "Luxury Retail"
  | "Commercial"
  | "Residential"
  | "Special Project";

export interface PortfolioCity {
  key: string;
  name: string; // full name, used in the city list and headings
  shortLabel: string; // short map-chip label, e.g. "TORONTO"
  x: number; // position in the 780×450 map viewBox
  y: number;
  labelDir: "left" | "right"; // which side the default (unzoomed) label chip opens toward
}

export interface PortfolioProject {
  id: number;
  name: string;
  category: ProjectCategory;
  city: string; // PortfolioCity.key
  location: string;
  description: string;
  placeholder: boolean; // true = demo/placeholder content, not a real completed project yet
}

export const CITIES: PortfolioCity[] = [
  { key: "gta", name: "Greater Toronto Area", shortLabel: "TORONTO", x: 469, y: 158, labelDir: "left" },
  { key: "boston", name: "Boston", shortLabel: "BOSTON", x: 528, y: 157, labelDir: "right" },
  { key: "miami", name: "Miami", shortLabel: "MIAMI", x: 496, y: 277, labelDir: "right" },
];

export const CATEGORIES: ProjectCategory[] = [
  "Luxury Retail",
  "Commercial",
  "Residential",
  "Special Project",
];

export const PROJECTS: PortfolioProject[] = [
  {
    id: 1,
    name: "Bangkok Garden",
    category: "Luxury Retail",
    city: "gta",
    location: "18 Elm St, Toronto",
    description:
      "A luxury retail fit-out in downtown Toronto, delivered with Rose Hill's full-coordination approach from design through final handover.",
    placeholder: false,
  },
  {
    id: 2,
    name: "Polar Dental",
    category: "Commercial",
    city: "gta",
    location: "3401 Dufferin St, Toronto",
    description:
      "Commercial tenant improvement and build-out, coordinated across all trades to minimize disruption during construction.",
    placeholder: false,
  },
  {
    id: 3,
    name: "Interfaceware Inc.",
    category: "Commercial",
    city: "gta",
    location: "672 Dupont St, Toronto",
    description:
      "Office and workspace build-out completed under Rose Hill's project management and quality assurance process.",
    placeholder: false,
  },
  {
    id: 4,
    name: "Harbour Square Residence",
    category: "Residential",
    city: "gta",
    location: "33 Harbour Square, Toronto",
    description:
      "A full residential renovation, from pre-construction planning through construction administration and closeout.",
    placeholder: false,
  },
  {
    id: 5,
    name: "Guerlain Spa, Hotel X",
    category: "Special Project",
    city: "gta",
    location: "Hotel X, Toronto",
    description:
      "A spa build-out completed while the hotel remained fully operational — today the top-producing Guerlain spa in Canada.",
    placeholder: false,
  },
  {
    id: 6,
    name: "Back Bay Flagship",
    category: "Luxury Retail",
    city: "boston",
    location: "Back Bay, Boston",
    description:
      "Placeholder entry for a Boston-area luxury retail project — swap in real photography and details once available.",
    placeholder: true,
  },
  {
    id: 7,
    name: "Seaport Office Fit-Out",
    category: "Commercial",
    city: "boston",
    location: "Seaport District, Boston",
    description:
      "Placeholder entry for a Boston-area commercial build-out — swap in real photography and details once available.",
    placeholder: true,
  },
  {
    id: 8,
    name: "South Beach Residence",
    category: "Residential",
    city: "miami",
    location: "South Beach, Miami",
    description:
      "Placeholder entry for a Miami-area residential project — swap in real photography and details once available.",
    placeholder: true,
  },
  {
    id: 9,
    name: "Brickell Retail Concept",
    category: "Luxury Retail",
    city: "miami",
    location: "Brickell, Miami",
    description:
      "Placeholder entry for a Miami-area retail project — swap in real photography and details once available.",
    placeholder: true,
  },
];

export const CATEGORY_COLOR: Record<ProjectCategory, string> = {
  "Luxury Retail": "var(--color-gold)",
  Commercial: "var(--color-medium-grey)",
  Residential: "var(--color-dark)",
  "Special Project": "var(--color-gold-light)",
};

// Card/modal image placeholder gradients (no real photography yet — see plan §7)
export const CARD_GRADIENT: Record<ProjectCategory, string> = {
  "Luxury Retail": "linear-gradient(135deg, var(--color-dark), var(--color-gold))",
  Commercial:
    "linear-gradient(135deg, var(--color-gold-contrast), var(--color-medium-grey))",
  Residential:
    "linear-gradient(135deg, var(--color-dark), var(--color-medium-grey))",
  "Special Project":
    "linear-gradient(135deg, var(--color-gold), var(--color-dark))",
};
