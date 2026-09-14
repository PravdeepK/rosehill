import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  // Matches the page: this is a subcontractor pre-qualification form, not a
  // job board. The old copy promised careers and delivered a vendor form.
  description:
    "Subcontractors and tradespeople: submit a pre-qualification form to work with Rose Hill Design Build on luxury retail, restaurant and commercial projects.",
  alternates: { canonical: "/careers" },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
