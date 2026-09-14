import Image from "next/image";
import { CARD_GRADIENT, type PortfolioProject } from "@/lib/portfolioMapData";
import { initials } from "./helpers";

interface PortfolioProjectCardProps {
  project: PortfolioProject;
  onOpen: () => void;
}

/**
 * Grid card for the listings section. Shows the project's first photo when it
 * has one; entries still awaiting photography (`images: []`) keep the original
 * gradient-plus-initials treatment. The whole card is a real <button> so it's
 * keyboard-reachable.
 */
export function PortfolioProjectCard({
  project,
  onOpen,
}: PortfolioProjectCardProps) {
  const cover = project.images[0];

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
        {cover ? (
          <Image
            src={cover.src}
            alt={`${project.name}, ${project.location}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute -bottom-6 -right-1.5 text-[96px] font-bold leading-none tracking-tight text-white/10"
          >
            {initials(project.name)}
          </span>
        )}
        {project.placeholder && (
          <span className="absolute left-3 top-3 z-10 bg-warm-white/85 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-dark">
            Demo placeholder
          </span>
        )}
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
