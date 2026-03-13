import Hero from "@/components/home/Hero";
import Advantage from "@/components/home/Advantage";
import Services from "@/components/home/Services";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Advantage />
      <Services />
      <FeaturedProjects />
      <Testimonials />
    </>
  );
}
