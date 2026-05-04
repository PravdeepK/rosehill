import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const SITE_URL = "https://rosehilldesignbuild.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rose Hill Design Build | Leaders in Luxury Retail",
    template: "%s | Rose Hill Design Build",
  },
  description:
    "Rose Hill Design Build delivers high-end design-build services specializing in luxury retail, commercial, and residential projects across North America.",
  icons: {
    icon: "/company-logos/rose-hill-cropped.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Rose Hill Design Build",
    title: "Rose Hill Design Build | Leaders in Luxury Retail",
    description:
      "High-end design-build services specializing in luxury retail, commercial, and residential projects across North America.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rose Hill Design Build | Leaders in Luxury Retail",
    description:
      "High-end design-build services specializing in luxury retail, commercial, and residential projects across North America.",
  },
  alternates: {
    canonical: SITE_URL,
  },
  keywords: [
    "design build",
    "luxury retail",
    "commercial construction",
    "retail fit-out",
    "restaurant construction",
    "Rose Hill",
    "North America",
    "general contractor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <JsonLd />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
