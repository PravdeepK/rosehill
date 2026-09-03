import type { Metadata } from "next";
import { PortfolioMapExperience } from "@/components/portfolio-map/PortfolioMapExperience";

export const metadata: Metadata = {
  title: "Portfolio Map",
  description:
    "Explore Rose Hill Design Build's projects across North America — select a city to see what we've built there.",
  alternates: { canonical: "/portfolio-map" },
};

export default function PortfolioMapPage() {
  return <PortfolioMapExperience />;
}
