import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Build your career with Rose Hill Design Build — luxury retail, commercial, and residential design-build projects across North America.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
