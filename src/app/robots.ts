import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  // normalize to https in case env is set to http by mistake
  const base = raw.replace(/^http:\/\//, "https://");

  return {
    rules: {
      userAgent: "*",
      allow: "/", // explicit allow
    },
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
