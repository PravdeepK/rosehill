import type { Metadata } from "next";
import { PortfolioMapExperience } from "@/components/portfolio-map/PortfolioMapExperience";

export const metadata: Metadata = {
  title: "Portfolio Map",
  description:
    "Rose Hill Design Build's completed projects across Canada and the United States, mapped city by city.",
  alternates: { canonical: "/portfolio-map" },
};

export default function PortfolioMapPage() {
  return <PortfolioMapExperience />;
}
