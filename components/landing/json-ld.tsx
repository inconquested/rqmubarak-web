import { site, siteUrl } from "@/lib/site";

/** Structured data: educational organization + site. Mirrors visible content. */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}/#organisasi`,
        name: site.name,
        url: siteUrl,
        logo: `${siteUrl}/logo-notext.svg`,
        description: site.description,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.phone,
          email: site.email,
          contactType: "customer service",
          areaServed: "ID",
          availableLanguage: "id",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#situs`,
        url: siteUrl,
        name: site.name,
        inLanguage: "id",
        publisher: { "@id": `${siteUrl}/#organisasi` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: first-party static JSON-LD data, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
