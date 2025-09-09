import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  // 1) force https; 2) collapse www -> apex; 3) derive bare host (no scheme) for robots "Host:"
  const httpsBase = raw.replace(/^http:\/\//, "https://");
  const apex = httpsBase.replace(/^https?:\/\/www\./, "https://");
  const host = apex.replace(/^https?:\/\//, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    host,                          // e.g. "dooncodingacademy.in"
    sitemap: `${apex}/sitemap.xml` // e.g. "https://dooncodingacademy.in/sitemap.xml"
  };
}
