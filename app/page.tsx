import Hero from "@/components/home/Hero";
import Advantage from "@/components/home/Advantage";
import Services from "@/components/home/Services";
import LogoWall from "@/components/home/LogoWall";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

/** Revalidate periodically so filesystem-driven logos refresh without per-request SSR. */
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <Advantage />
      <Services />
      <LogoWall />
      <Testimonials />
      <CallToAction />
    </>
  );
}
