import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/sign-up", "/forgot-password"],
        disallow: [
          "/api/",
          "/review/",
          "/insights",
          "/audit-log",
          "/otp",
          "/*?*", // Disallow URLs with query parameters (session tokens, etc.)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
