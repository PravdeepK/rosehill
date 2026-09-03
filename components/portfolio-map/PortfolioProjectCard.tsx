import { CARD_GRADIENT, type PortfolioProject } from "@/lib/portfolioMapData";
import { initials } from "./helpers";

interface PortfolioProjectCardProps {
  project: PortfolioProject;
  onOpen: () => void;
}

/**
 * Grid card for the listings section. Mirrors the approved prototype's card:
 * gradient placeholder image with an initials watermark, a "Demo placeholder"
 * tag for entries with no real project yet, and a hover-filled "View Project"
 * CTA. The whole card is a real <button> so it's keyboard-reachable — real
 * photography (via next/image) replaces the gradient once available (plan §7).
 */
export function PortfolioProjectCard({
  project,
  onOpen,
}: PortfolioProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
    >
      <div
        className="relative flex aspect-[4/3] items-end overflow-hidden"
        style={{ background: CARD_GRADIENT[project.category] }}
      >
        {project.placeholder && (
          <span className="absolute left-3 top-3 bg-warm-white/85 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-dark">
            Demo placeholder
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute -bottom-6 -right-1.5 text-[96px] font-bold leading-none tracking-tight text-white/10"
        >
          {initials(project.name)}
        </span>
        <span className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-300 group-hover:border-gold" />
      </div>

      <div className="pt-4">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-gold-contrast">
          {project.category}
        </span>
        <span className="mt-2 block text-base font-medium">{project.name}</span>
        <span className="mt-1 block text-xs text-medium-grey">
          {project.location}
        </span>
        <span className="mt-3 inline-block border border-dark px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-dark transition-colors duration-300 group-hover:bg-dark group-hover:text-warm-white">
          View Project
        </span>
      </div>
    </button>
  );
}
