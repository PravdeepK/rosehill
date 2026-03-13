import ProjectCarousel from "@/components/projects/ProjectCarousel";
import ProjectGrid from "@/components/projects/ProjectGrid";
import SectionLabel from "@/components/ui/SectionLabel";

export const metadata = {
  title: "Projects | Rosehill Design Build",
  description:
    "Explore our portfolio of luxury retail, commercial, and residential design-build projects across the Greater Toronto Area.",
};

export default function ProjectsPage() {
  return (
    <>
      <ProjectCarousel />
      <section className="py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <SectionLabel>Portfolio</SectionLabel>
            <h1 className="text-3xl md:text-4xl font-light mt-4">
              Our Projects
            </h1>
          </div>
          <ProjectGrid />
        </div>
      </section>
    </>
  );
}
