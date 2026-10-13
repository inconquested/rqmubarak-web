import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Owner portal fully hidden: no crawl, no sitemap.
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/portal"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
