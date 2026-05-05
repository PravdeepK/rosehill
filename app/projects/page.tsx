import ProjectCarousel from "@/components/projects/ProjectCarousel";
import ProjectGrid from "@/components/projects/ProjectGrid";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata = {
  title: "Projects",
  description:
    "Explore our portfolio of luxury retail, commercial, and residential design-build projects across North America.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <ProjectCarousel />
      <section className="py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <SectionLabel>Portfolio</SectionLabel>
            <h1 className="font-display text-3xl md:text-4xl mt-4">
              Our Projects
            </h1>
          </div>
          <ProjectGrid />
        </div>
      </section>
    </>
  );
}
