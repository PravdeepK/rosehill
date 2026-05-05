import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: SITE_NAME,
  url: SITE_URL,
  email: "info@rosehilldesignbuild.com",
  telephone: "+1-905-826-7673",
  description: SITE_DESCRIPTION,
  areaServed: [
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "United States" },
  ],
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: "6790 Kitimat Road, Unit 7",
      addressLocality: "Mississauga",
      addressRegion: "ON",
      postalCode: "L5N 5L9",
      addressCountry: "CA",
    },
    {
      "@type": "PostalAddress",
      streetAddress: "16192 Coastal Hwy.",
      addressLocality: "Lewes",
      addressRegion: "DE",
      postalCode: "19958",
      addressCountry: "US",
    },
  ],
  sameAs: [],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
    />
  );
}
