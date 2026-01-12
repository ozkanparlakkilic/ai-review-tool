import Script from "next/script";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "#webapp",
        name: "AI Output Review Tool",
        description:
          "Human-in-the-loop workflow for AI output review. Streamline your AI content validation with collaborative review queues.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "AI Content Review",
          "Review Queue Management",
          "Insights Dashboard",
          "Audit Log Tracking",
          "Bulk Actions",
          "Priority Management",
        ],
      },
      {
        "@type": "Organization",
        "@id": "#organization",
        name: "AI Review Tool",
        description: "Provider of AI output review and validation solutions",
      },
      {
        "@type": "WebSite",
        "@id": "#website",
        url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        name: "AI Output Review Tool",
        description: "Human-in-the-loop workflow for AI output review",
        publisher: {
          "@id": "#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") +
              "/?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
