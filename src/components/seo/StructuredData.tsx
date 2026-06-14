/**
 * Organization + Pharmacy (LocalBusiness) + WebSite JSON-LD.
 *
 * This is the single most important SEO signal for a local pharmacy: it powers
 * "pharmacy near me" results, Google Maps / knowledge-panel eligibility, and
 * the site-search box in search results. Rendered once in the root layout.
 */
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  BRANCHES,
  CONTACT,
  SOCIAL_PROFILES,
  absoluteUrl,
} from "@/lib/seo"

export default function StructuredData() {
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo/logo.png"),
    email: CONTACT.email,
    telephone: CONTACT.phone,
    description: SITE_DESCRIPTION,
    sameAs: SOCIAL_PROFILES,
  }

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  const pharmacies = BRANCHES.map((b) => ({
    "@type": "Pharmacy",
    "@id": `${SITE_URL}/#pharmacy-${b.area.toLowerCase()}`,
    name: b.name,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    url: SITE_URL,
    image: absoluteUrl("/logo/logo.png"),
    telephone: b.phone,
    email: CONTACT.email,
    priceRange: "₵₵",
    openingHours: b.hours,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.area,
      addressLocality: b.city,
      addressRegion: b.region,
      addressCountry: b.country,
    },
    areaServed: b.area,
    sameAs: SOCIAL_PROFILES,
  }))

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, website, ...pharmacies],
  }

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw text in a script tag; content is fully static.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
