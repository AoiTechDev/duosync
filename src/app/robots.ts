import type { MetadataRoute } from "next";
import { isProductionSite, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/feed", "/friends", "/profile", "/players/", "/onboarding", "/test-components"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
