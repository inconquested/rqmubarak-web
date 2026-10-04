import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Portal pemilik disembunyikan total: tidak di-crawl, tidak di sitemap.
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/portal"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
