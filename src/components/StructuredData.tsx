import Script from 'next/script'

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Cogna",
    "url": "https://cognaapp.com",
    "logo": "https://cognaapp.com/logo.png",
    "description": "Free brain tracking tools to monitor cognitive health through reaction time, speech pattern, and memory recall assessments.",
    "sameAs": [
      // Add your social media URLs here when available
      // "https://twitter.com/cogna",
      // "https://facebook.com/cogna"
    ]
  }

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cogna",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    },
    "description": "Track your cognitive health with quick, science-based assessments. Monitor reaction time, speech patterns, and memory recall over time."
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Cogna",
    "url": "https://cognaapp.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://cognaapp.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <Script
        id="web-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema)
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  )
}
