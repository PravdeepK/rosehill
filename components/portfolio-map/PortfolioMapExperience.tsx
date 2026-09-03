"use client";

import { useCallback, useMemo, useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import {
  CATEGORIES,
  CITIES,
  PROJECTS,
  type ProjectCategory,
} from "@/lib/portfolioMapData";
import { PortfolioMap } from "./PortfolioMap";
import { PortfolioProjectCard } from "./PortfolioProjectCard";
import { ProjectModal } from "./ProjectModal";
import { cityName, projectCount } from "./helpers";

type CategoryFilter = ProjectCategory | "all";

export function PortfolioMapExperience() {
  const [activeCity, setActiveCity] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [modalProjectId, setModalProjectId] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          (activeCity === "all" || p.city === activeCity) &&
          (activeCategory === "all" || p.category === activeCategory),
      ),
    [activeCity, activeCategory],
  );

  const modalProject = useMemo(
    () => PROJECTS.find((p) => p.id === modalProjectId) ?? null,
    [modalProjectId],
  );

  const closeModal = useCallback(() => setModalProjectId(null), []);

  const listingsTitle =
    activeCity === "all" ? "All Projects" : cityName(activeCity);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-dark px-6 pb-20 pt-32 text-warm-white md:pb-28 md:pt-40 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionLabel color="text-gold">Portfolio</SectionLabel>
            <h1 className="mt-4 max-w-2xl text-2xl font-light leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Explore what we&rsquo;ve built, city by city.
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-warm-white/75">
              From the Greater Toronto Area down to Boston and Miami &mdash;
              select a location on the map to see the projects Rose Hill has
              delivered there.
            </p>

            <div className="mt-10 grid max-w-xs grid-cols-3 sm:max-w-md">
              <Stat value={CITIES.length} label="Cities" first />
              <Stat value={PROJECTS.length} label="Projects" />
              <Stat value={2} label="Countries" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      <section className="bg-warm-grey px-6 py-20 md:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionLabel>Locations</SectionLabel>
            <h2 className="mt-2 max-w-xl text-2xl font-light md:text-3xl">
              Select a city to filter the portfolio.
            </h2>
          </Reveal>

          <div className="mt-9">
            <div className="relative border border-[#d9d6cd] bg-warm-white p-2">
              <PortfolioMap
                activeCity={activeCity}
                onSelectCity={setActiveCity}
                onSelectProject={setModalProjectId}
              />

              {activeCity !== "all" && (
                <p className="pointer-events-none absolute bottom-3 left-3 bg-warm-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-medium-grey">
                  {cityName(activeCity)}{" "}
                  <span className="tracking-normal">
                    &middot; click the hub to zoom out
                  </span>
                </p>
              )}
            </div>

            {/* Always-visible list of what's available — also the touch and
                keyboard path into each city (plan §6.4). */}
            <div className="mt-4 flex flex-wrap gap-2">
              <CityPill
                label="All Locations"
                count={PROJECTS.length}
                active={activeCity === "all"}
                onClick={() => setActiveCity("all")}
              />
              {CITIES.map((city) => (
                <CityPill
                  key={city.key}
                  label={city.name}
                  count={projectCount(city.key)}
                  active={activeCity === city.key}
                  onClick={() => setActiveCity(city.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-warm-grey pb-5">
            <div>
              <SectionLabel>Portfolio</SectionLabel>
              <h2 className="mt-1 text-2xl font-light">{listingsTitle}</h2>
              <p className="mt-1.5 text-sm text-medium-grey">
                {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {CATEGORIES.map((category) => (
                <FilterPill
                  key={category}
                  label={category}
                  active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-medium-grey">
              No projects in this category yet.
            </p>
          ) : (
            // `key` remounts the grid on filter change so the CSS stagger
            // re-runs — same technique as components/projects/ProjectGrid.tsx.
            <div
              key={`${activeCity}-${activeCategory}`}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((project, i) => (
                <div
                  key={project.id}
                  className="hero-fade-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <PortfolioProjectCard
                    project={project}
                    onOpen={() => setModalProjectId(project.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ProjectModal project={modalProject} onClose={closeModal} />
    </>
  );
}

function Stat({
  value,
  label,
  first = false,
}: {
  value: number;
  label: string;
  first?: boolean;
}) {
  return (
    <div
      className={`min-w-0 ${
        first
          ? "pr-2 sm:pr-5"
          : "border-l border-warm-white/20 px-2 sm:px-5"
      }`}
    >
      <div className="text-xl font-light text-gold md:text-3xl">{value}</div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-warm-white/60 sm:text-[11px] sm:tracking-[0.15em]">
        {label}
      </div>
    </div>
  );
}

function CityPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer border px-3.5 py-2 text-xs uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
        active
          ? "border-gold text-gold-contrast"
          : "border-warm-grey text-medium-grey hover:border-gold"
      }`}
    >
      {label} <span className="opacity-60">&middot; {count}</span>
    </button>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer border px-3.5 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 ${
        active
          ? "border-dark bg-dark text-warm-white"
          : "border-warm-grey text-medium-grey hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}
