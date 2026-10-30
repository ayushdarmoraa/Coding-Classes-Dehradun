import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const host = SITE.url.replace(/^https?:\/\//, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    host,
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
