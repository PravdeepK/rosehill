import Hero from "@/components/home/Hero";
import Advantage from "@/components/home/Advantage";
import Services from "@/components/home/Services";
import LogoWall from "@/components/home/LogoWall";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";

/** Read `public/logos` on each request so new assets show after refresh (no rebuild). */
export const dynamic = "force-dynamic";

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
