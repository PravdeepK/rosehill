"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard";
import FilterBar from "./FilterBar";
import { projects } from "@/lib/data";

export default function ProjectGrid() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div>
      <FilterBar active={activeFilter} onChange={setActiveFilter} />

      {/* `key` on the grid forces a remount when the filter changes so the
          CSS `fade-in` animation re-runs without needing framer-motion's
          AnimatePresence. */}
      <div
        key={activeFilter}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8"
      >
        {filtered.map((project, i) => (
          <div
            key={project.id}
            className="hero-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ProjectCard
              name={project.name}
              location={project.location}
              image={project.image}
              category={project.category}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-medium-grey py-12">
          No projects in this category yet.
        </p>
      )}
    </div>
  );
}
