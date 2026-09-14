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
              What we&rsquo;ve built, city by city.
            </h1>
            <p className="mt-4 max-w-xl leading-relaxed text-warm-white/75">
              Rose Hill Design Build works across Canada and the United States.
              Select a location on the map to see the work we&rsquo;ve completed
              there.
            </p>

            <div className="mt-10 flex">
              <Stat value="10+" label="Cities" first />
              <Stat value="500+" label="Projects" />
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

              {/* The hub and a tap on open water both zoom out, but neither is
                  discoverable — this is the visible way back, and the only one
                  sized for a finger. */}
              {activeCity !== "all" && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <p className="pointer-events-none hidden bg-warm-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-medium-grey sm:block">
                    {cityName(activeCity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCity("all")}
                    className="flex min-h-11 cursor-pointer items-center gap-1.5 border border-warm-grey bg-warm-white/95 px-3 text-[10px] uppercase tracking-[0.1em] text-dark transition-colors duration-200 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 sm:min-h-0 sm:py-1.5"
                  >
                    <span aria-hidden="true">&larr;</span> All locations
                  </button>
                </div>
              )}
            </div>

            {/* Always-visible list of what's available — also the touch and
                keyboard path into each city (plan §6.4). Below `md` the map
                drops its city chips and two of the pins sit ~17px apart, so
                these pills are the labelled, properly-sized equivalent
                control rather than a convenience. */}
            {/* Two even columns on a phone rather than flex-wrap: the names
                vary enough in length that wrapping left a ragged, gappy stack.
                "All" spans the row, so the six cities fill three clean ones. */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <CityPill
                label="All Locations"
                shortLabel="All"
                count={PROJECTS.length}
                active={activeCity === "all"}
                onClick={() => setActiveCity("all")}
                wide
              />
              {CITIES.map((city) => (
                <CityPill
                  key={city.key}
                  label={city.name}
                  shortLabel={city.shortLabel}
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

            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
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
            // re-runs.
            <div
              key={`${activeCity}-${activeCategory}`}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((project, i) => (
                <div
                  key={project.id}
                  className="hero-fade-up"
                  // Capped: an uncapped 80ms step left the last of 16 cards
                  // starting 1.2s in, so the grid took 2s to settle.
                  style={{ animationDelay: `${Math.min(i, 7) * 80}ms` }}
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
  value: string;
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
  shortLabel,
  count,
  active,
  onClick,
  wide = false,
}: {
  label: string;
  shortLabel: string;
  count: number;
  active: boolean;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // The visible text shortens on a phone, so name the button explicitly —
      // screen readers get the full city either way.
      aria-label={`${label}, ${count} project${count !== 1 ? "s" : ""}`}
      className={`flex min-h-11 cursor-pointer items-center justify-center border px-3 py-2 text-center text-xs uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 sm:min-h-0 sm:px-3.5 ${
        wide ? "col-span-2" : ""
      } ${
        active
          ? "border-gold bg-warm-white text-gold-contrast"
          : // Not border-warm-grey: this section's background *is* warm-grey,
            // so that border was invisible and the pills read as loose text.
            "border-medium-grey/30 bg-warm-white text-medium-grey hover:border-gold"
      }`}
    >
      <span aria-hidden="true">
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>{" "}
        <span className="opacity-60">&middot; {count}</span>
      </span>
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
      className={`flex min-h-11 cursor-pointer items-center justify-center border px-3 py-2 text-center text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 sm:min-h-0 sm:px-3.5 ${
        active
          ? "border-dark bg-dark text-warm-white"
          : "border-medium-grey/30 text-medium-grey hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}
